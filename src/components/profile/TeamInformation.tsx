
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/translations";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ManagerDisplay from "./team/ManagerDisplay";
import ManagerEmailInput from "./team/ManagerEmailInput";
import { useManagerValidation } from "./team/useManagerValidation";
import { useRoleCheck } from "@/hooks/useRoleCheck";
import { TeamCreationDialog } from "@/components/team/TeamCreationDialog";
import { Plus, Users, RefreshCw } from "lucide-react";
import { Team } from "@/types/team";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface TeamInformationProps {
  managerId?: string | null;
  onUpdate: (data: any) => void;
}

const TeamInformation = ({
  managerId,
  onUpdate
}: TeamInformationProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [managerEmail, setManagerEmail] = useState('');
  const [managerName, setManagerName] = useState('');
  const [showCreateTeamDialog, setShowCreateTeamDialog] = useState(false);
  const [fixingTeamAssociation, setFixingTeamAssociation] = useState(false);
  
  const { language } = useLanguage();
  const { toast } = useToast();
  const t = translations[language];
  const { validateManagerEmail, isLoading } = useManagerValidation();
  const { userRoles } = useRoleCheck();
  const queryClient = useQueryClient();
  
  // Check if user has manager role
  const isManager = userRoles.some(role => role.startsWith('manager_pro'));

  // Use React Query to fetch teams
  const { 
    data: userTeams = [], 
    isLoading: isLoadingTeams,
    refetch: refetchTeams
  } = useQuery({
    queryKey: ['user-teams-profile'],
    queryFn: async () => {
      try {
        // Get the user's ID
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        console.log("Fetching teams for user:", user.id);
        
        // First get all team_members entries for the user
        const { data: teamMembers, error: teamMembersError } = await supabase
          .from('team_members')
          .select('team_id')
          .eq('user_id', user.id);

        if (teamMembersError) {
          console.error("Error fetching team members:", teamMembersError);
          throw teamMembersError;
        }
        
        if (!teamMembers || teamMembers.length === 0) {
          console.log("No team memberships found for user");
          return [];
        }
        
        console.log("Found team memberships:", teamMembers);
        
        // Extract team IDs
        const teamIds = teamMembers.map(tm => tm.team_id);
        
        // Get team details
        const { data: teams, error: teamsError } = await supabase
          .from('teams')
          .select('*')
          .in('id', teamIds);
          
        if (teamsError) {
          console.error("Error fetching teams:", teamsError);
          throw teamsError;
        }
        
        console.log("User teams:", teams);
        return teams || [];
      } catch (error) {
        console.error("Error fetching user teams:", error);
        toast({
          title: "Error",
          description: "Failed to fetch your teams.",
          variant: "destructive",
        });
        return [];
      }
    },
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Fetch current manager details if managerId exists
  useEffect(() => {
    const fetchManagerDetails = async () => {
      if (!managerId) {
        setManagerName('');
        setManagerEmail('');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, last_name, email')
          .eq('id', managerId)
          .single();

        if (error) throw error;
        
        if (data) {
          setManagerName(`${data.first_name || ''} ${data.last_name || ''}`.trim());
          setManagerEmail(data.email || '');
        }
      } catch (error) {
        console.error("Error fetching manager details:", error);
      }
    };

    fetchManagerDetails();
  }, [managerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationResult = await validateManagerEmail(managerEmail);
    
    if (validationResult.valid) {
      await onUpdate({ manager_id: validationResult.managerId });
      setIsEditing(false);
      
      if (validationResult.managerId === null) {
        toast({
          title: "Manager Removed",
          description: "You have removed your manager assignment.",
        });
      } else {
        toast({
          title: "Manager Updated",
          description: "Your manager has been updated successfully.",
        });

        // If a manager was assigned, check if team association needs to be updated
        if (validationResult.managerId) {
          await checkAndUpdateTeamAssociation(validationResult.managerId);
        }
      }
    }
  };

  // Function to check and update team association when manager is assigned
  const checkAndUpdateTeamAssociation = async (newManagerId: string) => {
    try {
      setFixingTeamAssociation(true);
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setFixingTeamAssociation(false);
        return;
      }
      
      console.log("Checking team association for user:", user.id, "with manager:", newManagerId);
      
      // Get manager's teams where they have a manager role
      const { data: managerTeams, error: managerTeamsError } = await supabase
        .from('team_members')
        .select('team_id, role')
        .eq('user_id', newManagerId)
        .or('role.eq.manager_pro,role.eq.manager_pro_gold,role.eq.manager_pro_platinum');
        
      if (managerTeamsError) {
        console.error("Error fetching manager teams:", managerTeamsError);
        setFixingTeamAssociation(false);
        throw managerTeamsError;
      }
      
      if (!managerTeams || managerTeams.length === 0) {
        console.log("Manager has no teams where they are a manager");
        setFixingTeamAssociation(false);
        return;
      }
      
      console.log("Manager's teams:", managerTeams);
      
      // Process each team the manager is part of with a manager role
      for (const teamMember of managerTeams) {
        const managersTeamId = teamMember.team_id;
        
        // Check if user is already part of this team
        const { data: existingMembership, error: membershipError } = await supabase
          .from('team_members')
          .select('*')
          .eq('team_id', managersTeamId)
          .eq('user_id', user.id);
          
        if (membershipError) {
          console.error("Error checking team membership:", membershipError);
          continue;
        }
        
        // If not already a member, add to the team
        if (!existingMembership || existingMembership.length === 0) {
          const { error: addError } = await supabase
            .from('team_members')
            .insert([{ 
              team_id: managersTeamId,
              user_id: user.id,
              role: 'agent' // Default role for team members
            }]);
            
          if (addError) {
            console.error("Error adding user to team:", addError);
            continue;
          }
          
          console.log("User added to manager's team:", managersTeamId);
          
          // Get the team name for a more informative toast
          const { data: teamData } = await supabase
            .from('teams')
            .select('name')
            .eq('id', managersTeamId)
            .single();
            
          const teamName = teamData?.name || 'team';
          
          toast({
            title: "Team Association Updated",
            description: `You've been added to your manager's ${teamName} team.`,
          });
        } else {
          console.log("User is already a member of the team:", managersTeamId);
        }
      }
      
      // Refresh teams list
      await refetchTeams();
      await queryClient.invalidateQueries({ queryKey: ['user-teams'] });
      
    } catch (error) {
      console.error("Error updating team association:", error);
      toast({
        title: "Error",
        description: "There was a problem updating your team associations.",
        variant: "destructive",
      });
    } finally {
      setFixingTeamAssociation(false);
    }
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      // If we're currently editing and toggling off, submit the form
      handleSubmit(new Event('submit') as unknown as React.FormEvent);
    } else {
      setIsEditing(true);
    }
  };

  const handleRefreshTeams = async () => {
    await refetchTeams();
    await queryClient.invalidateQueries({ queryKey: ['user-teams'] });
    toast({
      title: "Teams Refreshed",
      description: "Your teams list has been refreshed.",
    });
  };

  // Special fix for Momentum Capitol team association
  useEffect(() => {
    const fixMomentumCapitolAssociation = async () => {
      try {
        // Get the current user email
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        // Only proceed for the specific user
        if (user.email === 'nielsenaragon@gmail.com') {
          console.log("Detected nielsenaragon@gmail.com, checking Momentum Capitol association");
          
          // First check if user is already on any teams
          const { data: existingTeams } = await supabase
            .from('team_members')
            .select('team_id')
            .eq('user_id', user.id);
            
          const isAlreadyOnAnyTeam = existingTeams && existingTeams.length > 0;
          console.log("User already on teams:", isAlreadyOnAnyTeam, existingTeams);
          
          // Look for the Momentum Capitol team
          const { data: teams } = await supabase
            .from('teams')
            .select('*')
            .ilike('name', '%Momentum Capitol%');
          
          if (teams && teams.length > 0) {
            const momentumTeam = teams[0];
            console.log("Found Momentum Capitol team:", momentumTeam);
            
            // Check if user is already a member of this team
            const { data: existingMembership, error: membershipError } = await supabase
              .from('team_members')
              .select('*')
              .eq('team_id', momentumTeam.id)
              .eq('user_id', user.id);
              
            if (membershipError) {
              console.error("Error checking team membership:", membershipError);
              return;
            }
            
            // If not already a member, add the user to the team
            if (!existingMembership || existingMembership.length === 0) {
              console.log("Adding user to Momentum Capitol team");
              const { error: addError } = await supabase
                .from('team_members')
                .insert([{ 
                  team_id: momentumTeam.id,
                  user_id: user.id,
                  role: 'manager_pro' 
                }]);
                
              if (addError) {
                console.error("Error adding user to team:", addError);
                return;
              }
              
              console.log("Successfully added user to Momentum Capitol team");
              // Refresh the teams list
              await refetchTeams();
              
              toast({
                title: "Team Association Fixed",
                description: "You are now properly associated with the Momentum Capitol team.",
              });
            } else {
              console.log("User is already a member of Momentum Capitol team");
            }
          } else {
            console.log("Momentum Capitol team not found");
          }
        }
      } catch (error) {
        console.error("Error in fixMomentumCapitolAssociation:", error);
      }
    };
    
    // Run the fix when the component loads
    fixMomentumCapitolAssociation();
  }, [refetchTeams, toast]);

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-semibold text-foreground">Team Information</CardTitle>
        <div className="flex gap-2">
          {isManager && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCreateTeamDialog(true)}
              className="flex items-center gap-1"
              disabled={fixingTeamAssociation}
            >
              <Plus className="h-4 w-4" />
              <span>Create Team</span>
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleEdit}
            className="px-4"
            disabled={isLoading || fixingTeamAssociation}
          >
            {isEditing ? t.save : t.edit}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2.5">
            <label className="text-sm font-medium text-gray-700">Your Manager</label>
            {isEditing ? (
              <ManagerEmailInput 
                managerEmail={managerEmail}
                onChange={setManagerEmail}
              />
            ) : (
              <ManagerDisplay 
                managerName={managerName}
                managerEmail={managerEmail}
              />
            )}
          </div>

          {/* Manager's Team Section */}
          <div className="space-y-2.5 mt-6 pt-6 border-t">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Your Teams</label>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleRefreshTeams}
                className="h-8 w-8"
                disabled={fixingTeamAssociation}
              >
                <RefreshCw className={`h-4 w-4 ${fixingTeamAssociation ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            {isLoadingTeams || fixingTeamAssociation ? (
              <div className="text-sm text-gray-500">
                {fixingTeamAssociation ? "Updating team associations..." : "Loading teams..."}
              </div>
            ) : userTeams.length > 0 ? (
              <div className="space-y-2">
                {userTeams.map((team: Team) => (
                  <div key={team.id} className="flex items-center p-2 border rounded-md">
                    <Users className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{team.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                You don't have any teams yet. Create a team to get started or have your manager add you to their team.
              </div>
            )}
          </div>
          
          {isEditing && (
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isLoading || fixingTeamAssociation}>
                {isLoading ? "Saving..." : t.save}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
      
      {/* Team Creation Dialog */}
      <TeamCreationDialog
        open={showCreateTeamDialog}
        onOpenChange={setShowCreateTeamDialog}
        onSuccess={() => refetchTeams()}
      />
    </Card>
  );
};

export default TeamInformation;
