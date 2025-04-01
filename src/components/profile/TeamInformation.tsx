
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
import { useQuery } from "@tanstack/react-query";

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
  
  const { language } = useLanguage();
  const { toast } = useToast();
  const t = translations[language];
  const { validateManagerEmail, isLoading } = useManagerValidation();
  const { userRoles } = useRoleCheck();
  
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
      }
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

  const handleRefreshTeams = () => {
    refetchTeams();
    toast({
      title: "Teams Refreshed",
      description: "Your teams list has been refreshed.",
    });
  };

  // Check for specific user and team
  useEffect(() => {
    const checkSpecificTeam = async () => {
      try {
        // Get the current user email
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        // Check if this is the specific user we're looking for
        if (user.email === 'nielsenaragon@gmail.com') {
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
              refetchTeams();
              
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
        console.error("Error in checkSpecificTeam:", error);
      }
    };
    
    if (isManager) {
      checkSpecificTeam();
    }
  }, [isManager, refetchTeams, toast]);

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

          {isManager && (
            <div className="space-y-2.5 mt-6 pt-6 border-t">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Your Teams</label>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleRefreshTeams}
                  className="h-8 w-8"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              {isLoadingTeams ? (
                <div className="text-sm text-gray-500">Loading teams...</div>
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
                  You don't have any teams yet. Create a team to get started.
                </div>
              )}
            </div>
          )}
          
          {isEditing && (
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isLoading}>
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
