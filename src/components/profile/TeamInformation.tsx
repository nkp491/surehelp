
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/translations";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ManagerDisplay from "./team/ManagerDisplay";
import ManagerEmailInput from "./team/ManagerEmailInput";
import { useManagerValidation } from "./team/useManagerValidation";
import { useRoleCheck } from "@/hooks/useRoleCheck";
import { TeamCreationDialog } from "@/components/team/TeamCreationDialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import TeamHeader from "./team/TeamHeader";
import TeamsList from "./team/TeamsList";
import TeamRefreshButton from "./team/TeamRefreshButton";
import { useTeamAssociationService } from "@/services/TeamAssociationService";

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
  const { checkAndUpdateTeamAssociation, fixMomentumCapitolAssociation } = useTeamAssociationService();
  
  const isManager = userRoles.some(role => role.startsWith('manager_pro'));
  const isAgent = userRoles.some(role => role === 'agent' || role === 'agent_pro');

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
        
        // First try to get teams directly
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

        // Check team memberships
        const { data: membershipData, error: membershipError } = await supabase
          .from('team_members')
          .select('team_id')
          .eq('user_id', user.id);
        
        if (membershipError) {
          console.error("Error checking team memberships:", membershipError);
          
          // Special case handling
          if (user.email === 'nielsenaragon@gmail.com') {
            const momentumTeams = teams.filter(team => 
              team.name.includes('Momentum Capitol') || team.name.includes('Momentum Capital')
            );
            console.log("Special case: Found Momentum teams:", momentumTeams);
            return momentumTeams || [];
          }
          
          // For agent users with a manager, try to get teams through manager
          if (isAgent && managerId) {
            return await fetchTeamsThroughManager(managerId, teams);
          }
          
          return [];
        }
        
        // If user has no direct team memberships
        if (!membershipData || membershipData.length === 0) {
          console.log("No direct team memberships found for user");
          
          // Special case handling
          if (user.email === 'nielsenaragon@gmail.com') {
            const momentumTeams = teams.filter(team => 
              team.name.includes('Momentum Capitol') || team.name.includes('Momentum Capital')
            );
            console.log("Special case: Found Momentum teams:", momentumTeams);
            return momentumTeams || [];
          }
          
          // For agent users with a manager, try to get teams through manager
          if (isAgent && managerId) {
            return await fetchTeamsThroughManager(managerId, teams);
          }
          
          return [];
        }

        // Filter and return the user's teams
        const teamIds = membershipData.map(tm => tm.team_id);
        const userTeams = teams.filter(team => teamIds.includes(team.id));
        console.log("User teams filtered:", userTeams);
        
        return userTeams;
      } catch (error) {
        console.error("Error in direct team fetch:", error);
        
        // Try another approach for users with manager
        if (isAgent && managerId) {
          try {
            return await fetchTeamsThroughManager(managerId);
          } catch (innerError) {
            console.error("Failed to fetch teams through manager:", innerError);
          }
        }
        
        // Last resort fallback for special case
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
    enabled: true
  });

  // Helper function to get teams through the user's manager
  const fetchTeamsThroughManager = async (managerId: string, allTeams?: any[]) => {
    console.log("Trying to fetch teams through manager:", managerId);
    
    // If we don't have all teams, fetch them first
    if (!allTeams) {
      const { data: teams } = await supabase
        .from('teams')
        .select('*')
        .order('name');
      allTeams = teams || [];
    }
    
    // Get team memberships for the manager
    const { data: managerTeams, error } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', managerId);
      
    if (error || !managerTeams || managerTeams.length === 0) {
      console.log("Manager has no teams or error fetching manager teams");
      return [];
    }
    
    // Filter to get just the manager's teams
    const managerTeamIds = managerTeams.map(tm => tm.team_id);
    const teamsFilteredByManager = allTeams.filter(team => managerTeamIds.includes(team.id));
    
    console.log("Found teams through manager:", teamsFilteredByManager.length);
    return teamsFilteredByManager;
  };

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
      } else if (isAgent && managerId) {
        // For agents with managers, try to associate them with their manager's teams
        console.log("Refreshing team associations for agent with manager:", managerId);
        
        // Get manager's teams
        const { data: managerTeams, error: managerTeamsError } = await supabase
          .from('team_members')
          .select('team_id')
          .eq('user_id', managerId);
          
        if (!managerTeamsError && managerTeams && managerTeams.length > 0) {
          console.log("Found manager teams:", managerTeams.length);
          
          // For each team the manager is in, add this user as well
          let teamsAdded = 0;
          for (const team of managerTeams) {
            // Check if already a member
            const { data: existingMembership } = await supabase
              .from('team_members')
              .select('id')
              .eq('team_id', team.team_id)
              .eq('user_id', user.id);
              
            if (!existingMembership || existingMembership.length === 0) {
              // Add user to the team
              const { error: addError } = await supabase
                .from('team_members')
                .insert([{ 
                  team_id: team.team_id,
                  user_id: user.id,
                  role: 'agent'
                }]);
                
              if (!addError) teamsAdded++;
            }
          }
          
          if (teamsAdded > 0) {
            toast({
              title: "Team Associations Updated",
              description: `You have been added to ${teamsAdded} team(s) associated with your manager.`,
            });
          }
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
    fixMomentumCapitolAssociation();
  }, []);

  return (
    <Card className="shadow-sm">
      <TeamHeader 
        isManager={isManager}
        onCreateTeamClick={() => setShowCreateTeamDialog(true)}
        onEditClick={handleToggleEdit}
        isEditing={isEditing}
        isLoading={isLoading}
        isFixing={fixingTeamAssociation}
      />
      
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
              <TeamRefreshButton 
                onClick={handleRefreshTeams} 
                loading={fixingTeamAssociation} 
              />
            </div>
            
            <TeamsList 
              teams={userTeams} 
              isLoading={isLoadingTeams}
              isFixing={fixingTeamAssociation}
            />
          </div>
          
          {isEditing && (
            <div className="flex justify-end pt-2">
              <button type="submit" className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors" disabled={isLoading || fixingTeamAssociation}>
                {isLoading ? "Saving..." : t.save}
              </button>
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
