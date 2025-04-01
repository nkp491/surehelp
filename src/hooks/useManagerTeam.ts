
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/profile";
import { TeamMember } from "@/types/team";
import { toast } from "@/hooks/use-toast";

export const useManagerTeam = (managerId?: string) => {
  // Get all team members where manager_id = managerId
  const { data: teamMembers, isLoading, error, refetch } = useQuery({
    queryKey: ['manager-team', managerId],
    queryFn: async () => {
      if (!managerId) return [];

      console.log("Fetching team members for manager:", managerId);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('manager_id', managerId);

      if (error) {
        console.error("Error fetching team members:", error);
        throw error;
      }
      
      console.log(`Found ${data?.length || 0} team members for manager:`, managerId);
      
      // Transform the data to match our TeamMember type instead of Profile
      // This ensures compatibility with the team filtering functionality
      // We're creating a simplified version here since we don't have the actual team_id in profiles
      return data.map(profile => ({
        id: profile.id,
        user_id: profile.id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
        profile_image_url: profile.profile_image_url,
        // For other TeamMember fields, we set defaults
        team_id: "", // This will be populated later if filtering by team
        role: "",
        created_at: profile.created_at,
        updated_at: profile.updated_at
      })) as TeamMember[];
    },
    enabled: !!managerId,
    staleTime: 1000 * 60 * 2, // Consider data fresh for 2 minutes (reduced from default)
    refetchOnWindowFocus: true, // Refresh data when window regains focus
  });

  // Update a team member's manager
  const updateTeamMemberManager = async (memberId: string, newManagerId: string | null) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ manager_id: newManagerId })
        .eq('id', memberId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: newManagerId 
          ? "Team member has been assigned to a new manager." 
          : "Team member has been removed from your team.",
      });
      
      refetch();
      return true;
    } catch (error: any) {
      console.error("Error updating team member:", error.message);
      toast({
        title: "Error",
        description: "Failed to update team member. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Get team members under managers that have this manager as their manager
  const getNestedTeamMembers = async () => {
    if (!managerId) return [];
    
    try {
      // First get managers who have this manager as their manager
      const { data: subManagers, error: subManagerError } = await supabase
        .from('profiles')
        .select('*')
        .eq('manager_id', managerId)
        .or(`role.eq.manager_pro,role.eq.manager_pro_gold,role.eq.manager_pro_platinum`);
        
      if (subManagerError) throw subManagerError;
      
      if (!subManagers || subManagers.length === 0) return [];
      
      console.log(`Found ${subManagers.length} sub-managers for manager:`, managerId);
      
      // Get the IDs of all sub-managers
      const subManagerIds = subManagers.map(manager => manager.id);
      
      // Now get all team members who have any of these sub-managers as their manager
      const { data: nestedMembers, error: membersError } = await supabase
        .from('profiles')
        .select('*')
        .in('manager_id', subManagerIds);
        
      if (membersError) throw membersError;
      
      console.log(`Found ${nestedMembers?.length || 0} nested team members for sub-managers`);
      
      // Transform the data to match our TeamMember type for consistency
      return nestedMembers.map(profile => ({
        id: profile.id,
        user_id: profile.id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
        profile_image_url: profile.profile_image_url,
        team_id: "", // This would need to be joined from team_members table
        role: "",
        created_at: profile.created_at,
        updated_at: profile.updated_at
      })) as TeamMember[];
    } catch (error) {
      console.error("Error fetching nested team members:", error);
      return [];
    }
  };
  
  // Get nested team members query
  const { 
    data: nestedTeamMembers, 
    isLoading: isLoadingNested, 
    refetch: refetchNested 
  } = useQuery({
    queryKey: ['nested-team-members', managerId],
    queryFn: getNestedTeamMembers,
    enabled: !!managerId && (managerId?.length > 0),
    staleTime: 1000 * 60 * 2, // Consider data fresh for 2 minutes
  });

  // Combined refetch function
  const refetchAll = async () => {
    await refetch();
    await refetchNested();
  };

  return {
    teamMembers,
    nestedTeamMembers,
    isLoading: isLoading || isLoadingNested,
    error,
    updateTeamMemberManager,
    refetch: refetchAll
  };
};
