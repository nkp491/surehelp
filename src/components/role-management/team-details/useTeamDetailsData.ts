
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { fetchTeamMembersByTeam } from "@/hooks/team/utils/teamMembers";
import { TeamMember } from "@/types/team";

interface Team {
  id: string;
  name: string;
  created_at: string;
}

interface RelatedTeam {
  id: string;
  name: string;
  relationship: string;
}

export function useTeamDetailsData(team: Team, onTeamDeleted: () => void) {
  const [isLoading, setIsLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [relatedTeams, setRelatedTeams] = useState<RelatedTeam[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  
  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Fetch team details when dialog opens
  useEffect(() => {
    if (team) {
      fetchTeamDetails();
    }
  }, [team]);

  const fetchTeamDetails = async () => {
    setIsLoading(true);
    try {
      // Use the fetchTeamMembersByTeam utility to avoid RLS recursion issues
      const membersData = await fetchTeamMembersByTeam(team.id);
      // The fetchTeamMembersByTeam returns data in the expected TeamMember format
      setTeamMembers(membersData);

      // Fetch related teams (parent teams) - Using explicit column specifications
      try {
        const { data: parentRelations, error: parentError } = await supabase
          .from("team_relationships")
          .select("parent_team_id")
          .eq("child_team_id", team.id);

        // Fetch parent team details separately
        let parentTeams: RelatedTeam[] = [];
        
        if (parentRelations && !parentError && parentRelations.length > 0) {
          const parentIds = parentRelations.map(relation => relation.parent_team_id);
          
          const { data: parentTeamsData, error: parentTeamsError } = await supabase
            .from("teams")
            .select("id, name")
            .in("id", parentIds);
            
          if (parentTeamsData && !parentTeamsError) {
            parentTeams = parentTeamsData.map(team => ({
              id: team.id,
              name: team.name,
              relationship: 'Parent'
            }));
          } else if (parentTeamsError) {
            console.error("Error fetching parent teams:", parentTeamsError);
          }
        }

        // Fetch related teams (child teams) - Using explicit column specifications
        const { data: childRelations, error: childError } = await supabase
          .from("team_relationships")
          .select("child_team_id")
          .eq("parent_team_id", team.id);

        // Fetch child team details separately
        let childTeams: RelatedTeam[] = [];
        
        if (childRelations && !childError && childRelations.length > 0) {
          const childIds = childRelations.map(relation => relation.child_team_id);
          
          const { data: childTeamsData, error: childTeamsError } = await supabase
            .from("teams")
            .select("id, name")
            .in("id", childIds);
            
          if (childTeamsData && !childTeamsError) {
            childTeams = childTeamsData.map(team => ({
              id: team.id,
              name: team.name,
              relationship: 'Child'
            }));
          } else if (childTeamsError) {
            console.error("Error fetching child teams:", childTeamsError);
          }
        }

        if (!parentError && !childError) {
          // Combine both parent and child teams
          setRelatedTeams([...parentTeams, ...childTeams]);
        } else {
          console.error("Error fetching related teams:", parentError || childError);
        }
      } catch (error) {
        console.error("Error fetching related teams:", error);
      }
      
    } catch (error) {
      console.error("Error in fetchTeamDetails:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading team details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTeam = async () => {
    setIsDeleting(true);
    try {
      // First, delete team members
      const { error: membersError } = await supabase
        .from("team_members")
        .delete()
        .eq("team_id", team.id);

      if (membersError) {
        console.error("Error deleting team members:", membersError);
        toast({
          title: "Error",
          description: "Failed to delete team members.",
          variant: "destructive",
        });
        return;
      }

      // Next, delete any team bulletins
      const { error: bulletinsError } = await supabase
        .from("team_bulletins")
        .delete()
        .eq("team_id", team.id);

      if (bulletinsError) {
        console.error("Error deleting team bulletins:", bulletinsError);
      }

      // Delete team relationships
      const { error: relParentError } = await supabase
        .from("team_relationships")
        .delete()
        .eq("parent_team_id", team.id);

      if (relParentError) {
        console.error("Error deleting parent team relationships:", relParentError);
      }

      const { error: relChildError } = await supabase
        .from("team_relationships")
        .delete()
        .eq("child_team_id", team.id);

      if (relChildError) {
        console.error("Error deleting child team relationships:", relChildError);
      }

      // Delete any team invitations
      const { error: invitationsError } = await supabase
        .from("team_invitations")
        .delete()
        .eq("team_id", team.id);

      if (invitationsError) {
        console.error("Error deleting team invitations:", invitationsError);
      }

      // Finally, delete the team
      const { error: teamError } = await supabase
        .from("teams")
        .delete()
        .eq("id", team.id);

      if (teamError) {
        console.error("Error deleting team:", teamError);
        toast({
          title: "Error",
          description: "Failed to delete team.",
          variant: "destructive",
        });
        return;
      }

      // Success
      toast({
        title: "Success",
        description: "Team deleted successfully.",
      });

      // Notify parent component
      onTeamDeleted();
    } catch (error) {
      console.error("Error deleting team:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the team.",
        variant: "destructive",
      });
    } finally {
      setShowDeleteConfirm(false);
      setIsDeleting(false);
    }
  };
  
  return {
    isLoading,
    teamMembers,
    relatedTeams,
    showDeleteConfirm,
    setShowDeleteConfirm,
    isDeleting,
    formatDate,
    handleDeleteTeam
  };
}
