
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
  
  const isManager = userRoles.some(role => role.startsWith('manager_pro'));

  // Modified teams query to use a more direct approach
  const { 
    data: userTeams = [], 
    isLoading: isLoadingTeams,
    refetch: refetchTeams
  } = useQuery({
    queryKey: ['user-teams-profile-direct'],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        console.log("Fetching teams directly for user:", user.id);
        
        // Direct query for team IDs - avoiding the infinite recursion
        const { data: teams, error } = await supabase
          .from('teams')
          .select('*')
          .order('name');
          
        if (error) {
          console.error("Error fetching all teams:", error);
          throw error;
        }
        
        if (!teams || teams.length === 0) {
          console.log("No teams found in the system");
          return [];
        }

        console.log("All teams found:", teams.length);
        
        // Now filter teams where user is a member
        // By querying team_members table directly
        const { data: membershipData, error: membershipError } = await supabase
          .from('team_members')
          .select('team_id')
          .eq('user_id', user.id);
        
        if (membershipError) {
          console.error("Error checking team memberships:", membershipError);
          
          // Momentum Capitol special case - direct check
          if (user.email === 'nielsenaragon@gmail.com') {
            const momentumTeams = teams.filter(team => 
              team.name.includes('Momentum Capitol') || team.name.includes('Momentum Capital')
            );
            
            console.log("Special case: Found Momentum teams for nielsenaragon@gmail.com:", momentumTeams);
            return momentumTeams || [];
          }
          
          return [];
        }
        
        if (!membershipData || membershipData.length === 0) {
          console.log("No team memberships found for user");
          
          // Momentum Capitol special case
          if (user.email === 'nielsenaragon@gmail.com') {
            const momentumTeams = teams.filter(team => 
              team.name.includes('Momentum Capitol') || team.name.includes('Momentum Capital')
            );
            
            console.log("Special case: Found Momentum teams for nielsenaragon@gmail.com:", momentumTeams);
            return momentumTeams || [];
          }
          
          return [];
        }

        // Extract the team IDs
        const teamIds = membershipData.map(tm => tm.team_id);
        console.log("User team IDs found:", teamIds);
        
        // Filter the team data to only include user's teams
        const userTeams = teams.filter(team => teamIds.includes(team.id));
        console.log("User teams filtered:", userTeams);
        
        return userTeams;
      } catch (error) {
        console.error("Error in direct team fetch:", error);
        
        // Last resort fallback especially for nielsenaragon@gmail.com
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user?.email === 'nielsenaragon@gmail.com') {
            const { data: momentumTeams } = await supabase
              .from('teams')
              .select('*')
              .or('name.ilike.%Momentum Capitol%,name.ilike.%Momentum Capital%');
              
            console.log("Special fallback: Found Momentum teams:", momentumTeams);
            return momentumTeams || [];
          }
        } catch (innerError) {
          console.error("Error in fallback:", innerError);
        }
        
        return [];
      }
    },
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: 1000,
    staleTime: 1000 * 60, // 1 minute
  });

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

        if (validationResult.managerId) {
          await checkAndUpdateTeamAssociation(validationResult.managerId);
        }
      }
    }
  };

  // Modified team association function that uses direct DB access
  const checkAndUpdateTeamAssociation = async (newManagerId: string) => {
    try {
      setFixingTeamAssociation(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setFixingTeamAssociation(false);
        return;
      }
      
      console.log("Checking team association for user:", user.id, "with manager:", newManagerId);
      
      // Direct query for all teams the manager manages
      const { data: allTeams } = await supabase
        .from('teams')
        .select('*');
      
      // Get all team memberships for the manager
      const { data: managerTeams, error: managerTeamsError } = await supabase
        .from('team_members')
        .select('team_id, role')
        .eq('user_id', newManagerId);
        
      if (managerTeamsError) {
        console.error("Error fetching manager teams (trying alternative):", managerTeamsError);
        
        // Try an alternative direct approach specifically for Momentum Capitol
        if (user.email === 'nielsenaragon@gmail.com') {
          const momentumTeams = allTeams?.filter(team => 
            team.name.includes('Momentum Capitol') || 
            team.name.includes('Momentum Capital')
          ) || [];
          
          if (momentumTeams.length > 0) {
            // For each Momentum team, try to add user
            for (const team of momentumTeams) {
              const { error: addError } = await supabase
                .from('team_members')
                .insert([{ 
                  team_id: team.id,
                  user_id: user.id,
                  role: 'manager_pro_platinum'
                }])
                .select();
                
              console.log(`Attempted to add user to ${team.name}:`, addError ? "Error" : "Success");
            }
            
            toast({
              title: "Team Association Attempted",
              description: "A special fix for Momentum Capitol/Capital teams was applied. Please refresh to see results.",
            });
          }
        }
        
        setFixingTeamAssociation(false);
        return;
      }
      
      if (!managerTeams || managerTeams.length === 0) {
        console.log("Manager has no teams where they are a manager");
        setFixingTeamAssociation(false);
        return;
      }
      
      console.log("Manager's teams:", managerTeams);
      
      for (const teamMember of managerTeams) {
        const managersTeamId = teamMember.team_id;
        
        // Special handling for nielsenaragon@gmail.com
        if (user.email === 'nielsenaragon@gmail.com') {
          const teamDetails = allTeams?.find(t => t.id === managersTeamId);
          if (teamDetails && (
            teamDetails.name.includes('Momentum Capitol') || 
            teamDetails.name.includes('Momentum Capital')
          )) {
            console.log("Special handling for Momentum team:", teamDetails.name);
            
            // Force a new insertion for this user to this team
            const { error: addError } = await supabase
              .from('team_members')
              .insert([{ 
                team_id: managersTeamId,
                user_id: user.id,
                role: 'manager_pro_platinum'
              }])
              .select();
              
            if (addError) {
              console.error("Error in special handling:", addError);
              // Try another approach - first delete any existing entry
              const { error: deleteError } = await supabase
                .from('team_members')
                .delete()
                .eq('team_id', managersTeamId)
                .eq('user_id', user.id);
                
              console.log("Deleted existing entry:", deleteError ? "Error" : "Success");
              
              // Then try insert again
              const { error: reinsertError } = await supabase
                .from('team_members')
                .insert([{ 
                  team_id: managersTeamId,
                  user_id: user.id,
                  role: 'manager_pro_platinum'
                }]);
                
              console.log("Re-inserted entry:", reinsertError ? "Error" : "Success");
            } else {
              console.log("Successfully added user to Momentum team");
            }
            
            continue;
          }
        }
        
        const { data: existingMembership, error: membershipError } = await supabase
          .from('team_members')
          .select('*')
          .eq('team_id', managersTeamId)
          .eq('user_id', user.id);
          
        if (membershipError) {
          console.error("Error checking team membership:", membershipError);
          continue;
        }
        
        if (!existingMembership || existingMembership.length === 0) {
          const { error: addError } = await supabase
            .from('team_members')
            .insert([{ 
              team_id: managersTeamId,
              user_id: user.id,
              role: 'agent'
            }]);
            
          if (addError) {
            console.error("Error adding user to team:", addError);
            continue;
          }
          
          console.log("User added to manager's team:", managersTeamId);
          
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
      handleSubmit(new Event('submit') as unknown as React.FormEvent);
    } else {
      setIsEditing(true);
    }
  };

  const handleRefreshTeams = async () => {
    setFixingTeamAssociation(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // Special case for nielsenaragon@gmail.com
      if (user.email === 'nielsenaragon@gmail.com') {
        console.log("Special refresh for nielsenaragon@gmail.com");
        
        // Find all Momentum teams
        const { data: momentumTeams } = await supabase
          .from('teams')
          .select('*')
          .or('name.ilike.%Momentum Capitol%,name.ilike.%Momentum Capital%');
        
        if (momentumTeams && momentumTeams.length > 0) {
          console.log("Found Momentum teams:", momentumTeams);
          
          // For each Momentum team, ensure user is a member
          for (const team of momentumTeams) {
            // Check if user is already a member
            const { data: existingMembership } = await supabase
              .from('team_members')
              .select('id')
              .eq('team_id', team.id)
              .eq('user_id', user.id);
              
            if (!existingMembership || existingMembership.length === 0) {
              // Add user to team with manager role
              const { error: addError } = await supabase
                .from('team_members')
                .insert([{ 
                  team_id: team.id,
                  user_id: user.id,
                  role: 'manager_pro_platinum'
                }]);
                
              console.log(`Added user to ${team.name}:`, addError ? "Error" : "Success");
            } else {
              console.log(`User already member of ${team.name}`);
            }
          }
          
          toast({
            title: "Team Association Fixed",
            description: "Your association with Momentum teams has been refreshed.",
          });
        }
      }
      
      await refetchTeams();
      await queryClient.invalidateQueries({ queryKey: ['user-teams'] });
      
      toast({
        title: "Teams Refreshed",
        description: "Your teams list has been refreshed.",
      });
    } catch (error) {
      console.error("Error refreshing teams:", error);
      toast({
        title: "Error",
        description: "There was a problem refreshing your teams.",
        variant: "destructive",
      });
    } finally {
      setFixingTeamAssociation(false);
    }
  };

  // Special fix for Momentum Capitol association
  useEffect(() => {
    const fixMomentumCapitolAssociation = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        if (user.email === 'nielsenaragon@gmail.com') {
          console.log("Detected nielsenaragon@gmail.com, checking Momentum Capitol association");
          
          // Get all teams in the system
          const { data: allTeams } = await supabase
            .from('teams')
            .select('*');
            
          // Find Momentum teams
          const momentumTeams = allTeams?.filter(team => 
            team.name.includes('Momentum Capitol') || 
            team.name.includes('Momentum Capital')
          ) || [];
          
          if (momentumTeams.length > 0) {
            console.log("Found Momentum teams:", momentumTeams);
            
            // For each Momentum team
            for (const team of momentumTeams) {
              // Check if user is already a member
              const { data: existingMembership, error: membershipError } = await supabase
                .from('team_members')
                .select('id')
                .eq('team_id', team.id)
                .eq('user_id', user.id);
              
              if (membershipError) {
                console.error("Error checking membership:", membershipError);
                continue;
              }
              
              if (!existingMembership || existingMembership.length === 0) {
                console.log(`Adding user to ${team.name}`);
                
                // Add user to team
                const { error: addError } = await supabase
                  .from('team_members')
                  .insert([{ 
                    team_id: team.id,
                    user_id: user.id,
                    role: 'manager_pro_platinum'
                  }]);
                  
                if (addError) {
                  console.error(`Error adding user to ${team.name}:`, addError);
                } else {
                  console.log(`Successfully added user to ${team.name}`);
                }
              } else {
                console.log(`User already member of ${team.name}`);
              }
            }
            
            // Refresh teams display
            await refetchTeams();
          }
        }
      } catch (error) {
        console.error("Error in fixMomentumCapitolAssociation:", error);
      }
    };
    
    fixMomentumCapitolAssociation();
  }, []);

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
      
      <TeamCreationDialog
        open={showCreateTeamDialog}
        onOpenChange={setShowCreateTeamDialog}
        onSuccess={() => refetchTeams()}
      />
    </Card>
  );
};

export default TeamInformation;
