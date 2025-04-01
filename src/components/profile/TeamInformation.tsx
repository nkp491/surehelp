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
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

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
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  
  const { language } = useLanguage();
  const { toast } = useToast();
  const t = translations[language];
  const { validateManagerEmail, isLoading } = useManagerValidation();
  const { userRoles } = useRoleCheck();
  const queryClient = useQueryClient();
  const { 
    checkAndUpdateTeamAssociation, 
    fixMomentumCapitolAssociation,
    forceAgentTeamAssociation,
    isProcessing 
  } = useTeamAssociationService();
  
  const isManager = userRoles.some(role => role.startsWith('manager_pro'));
  const isAgent = userRoles.some(role => role === 'agent' || role === 'agent_pro');

  const { 
    data: userTeams = [], 
    isLoading: isLoadingTeams,
    refetch: refetchTeams,
    error: teamsError
  } = useQuery({
    queryKey: ['user-teams-profile-direct'],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        console.log("Fetching teams directly for user:", user.id);
        
        const { data: teamMemberships, error: membershipError } = await supabase
          .from('team_members')
          .select('team_id')
          .eq('user_id', user.id);
          
        if (membershipError) {
          console.error("Error fetching team memberships:", membershipError);
          throw membershipError;
        }
        
        if (!teamMemberships || teamMemberships.length === 0) {
          console.log("No direct team memberships found for user");
          
          if (user.email === 'nielsenaragon@gmail.com') {
            return await fetchMomentumTeams();
          }
          
          if (isAgent && managerId) {
            return await fetchTeamsThroughManager(managerId);
          }
          
          return [];
        }
        
        const teamIds = teamMemberships.map(tm => tm.team_id);
        
        const { data: teams, error: teamsError } = await supabase
          .from('teams')
          .select('*')
          .in('id', teamIds)
          .order('name');
          
        if (teamsError) {
          console.error("Error fetching teams:", teamsError);
          throw teamsError;
        }
        
        console.log("Found teams:", teams?.length || 0);
        return teams || [];
      } catch (error) {
        console.error("Error in fetchTeams:", error);
        
        if (isAgent && managerId) {
          try {
            return await fetchTeamsThroughManager(managerId);
          } catch (innerError) {
            console.error("Failed to fetch teams through manager:", innerError);
            setAlertMessage("There was a problem loading your teams. Try using the refresh button.");
            setShowAlert(true);
          }
        }
        
        if (await checkSpecialUserCase()) {
          return await fetchMomentumTeams();
        }
        
        return [];
      }
    },
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: 1000,
    staleTime: 1000 * 30,
    enabled: true
  });

  const checkSpecialUserCase = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.email === 'nielsenaragon@gmail.com';
    } catch (error) {
      return false;
    }
  };

  const fetchMomentumTeams = async () => {
    console.log("Fetching Momentum teams");
    
    const { data: momentumTeams } = await supabase
      .from('teams')
      .select('*')
      .or('name.ilike.%Momentum Capitol%,name.ilike.%Momentum Capital%');
      
    console.log("Found Momentum teams:", momentumTeams);
    return momentumTeams || [];
  };

  const fetchTeamsThroughManager = async (managerId: string) => {
    console.log("Trying to fetch teams through manager:", managerId);
    
    const { data: managerTeams, error } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', managerId);
      
    if (error || !managerTeams || managerTeams.length === 0) {
      console.log("Manager has no teams or error fetching manager teams");
      return [];
    }
    
    const teamIds = managerTeams.map(tm => tm.team_id);
    
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*')
      .in('id', teamIds)
      .order('name');
      
    if (teamsError) {
      console.error("Error fetching teams through manager:", teamsError);
      return [];
    }
    
    console.log("Found teams through manager:", teams?.length || 0);
    return teams || [];
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

  useEffect(() => {
    const checkAutoAssociation = async () => {
      if (isAgent && managerId && userTeams.length === 0 && !isLoadingTeams && !fixingTeamAssociation) {
        console.log("Agent has manager but no teams, checking auto-association");
        await handleForceTeamAssociation();
      }
    };
    
    checkAutoAssociation();
  }, [isAgent, managerId, userTeams, isLoadingTeams]);

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
    setShowAlert(false);
    setFixingTeamAssociation(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      if (user.email === 'nielsenaragon@gmail.com') {
        console.log("Special refresh for nielsenaragon@gmail.com");
        await fixMomentumCapitolAssociation();
      } 
      else if (isAgent && managerId) {
        console.log("Agent refresh - associating with manager's teams");
        const success = await checkAndUpdateTeamAssociation(managerId);
        
        if (!success) {
          setAlertMessage("Could not find any teams associated with your manager. Please contact your manager.");
          setShowAlert(true);
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
      
      setAlertMessage("Failed to refresh teams. Please try again later.");
      setShowAlert(true);
    } finally {
      setFixingTeamAssociation(false);
    }
  };

  const handleForceTeamAssociation = async () => {
    setShowAlert(false);
    setFixingTeamAssociation(true);
    
    try {
      const success = await forceAgentTeamAssociation();
      
      if (success) {
        await refetchTeams();
        
        toast({
          title: "Teams Updated",
          description: "Your team associations have been updated.",
        });
      } else {
        setAlertMessage("Could not associate you with your manager's teams. Your manager may not have any teams yet.");
        setShowAlert(true);
      }
    } catch (error) {
      console.error("Error in force team association:", error);
      setAlertMessage("Failed to update team associations. Please try again later.");
      setShowAlert(true);
    } finally {
      setFixingTeamAssociation(false);
    }
  };

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
        isFixing={fixingTeamAssociation || isProcessing}
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
                loading={fixingTeamAssociation || isProcessing} 
              />
            </div>
            
            {showAlert && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Team Association Issue</AlertTitle>
                <AlertDescription className="flex flex-col gap-2">
                  <p>{alertMessage}</p>
                  {isAgent && managerId && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleForceTeamAssociation}
                      disabled={fixingTeamAssociation || isProcessing}
                      className="self-start"
                    >
                      Force Team Association
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            )}
            
            <TeamsList 
              teams={userTeams} 
              isLoading={isLoadingTeams}
              isFixing={fixingTeamAssociation || isProcessing}
            />
          </div>
          
          {isEditing && (
            <div className="flex justify-end pt-2">
              <button type="submit" className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors" disabled={isLoading || fixingTeamAssociation || isProcessing}>
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
