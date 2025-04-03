
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTeamAssociationService } from "@/services/team-association";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Team } from "@/types/team";

export const useTeamInformationLogic = (managerId?: string | null) => {
  const [isEditing, setIsEditing] = useState(false);
  const [managerEmail, setManagerEmail] = useState('');
  const [managerName, setManagerName] = useState('');
  const [fixingTeamAssociation, setFixingTeamAssociation] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { 
    checkAndUpdateTeamAssociation, 
    fixMomentumCapitolAssociation,
    forceAgentTeamAssociation,
    isProcessing 
  } = useTeamAssociationService();

  // Fetch user teams
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
        
        // Get the team memberships
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
          
          if (managerId) {
            return await fetchTeamsThroughManager(managerId);
          }
          
          return [];
        }
        
        const teamIds = teamMemberships.map(tm => tm.team_id);
        console.log("Found team IDs:", teamIds);
        
        // Get the team details
        const { data: teams, error: teamsError } = await supabase
          .from('teams')
          .select('*')
          .in('id', teamIds)
          .order('name');
          
        if (teamsError) {
          console.error("Error fetching teams:", teamsError);
          throw teamsError;
        }
        
        console.log("Found teams:", teams?.length || 0, teams);
        return teams || [];
      } catch (error) {
        console.error("Error in fetchTeams:", error);
        
        if (managerId) {
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

  // Fetch manager details
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

  // Init special case fix
  useEffect(() => {
    fixMomentumCapitolAssociation();
  }, []);

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
      else if (managerId) {
        console.log("Agent refresh - associating with manager's teams");
        const success = await checkAndUpdateTeamAssociation(managerId);
        
        if (!success) {
          setAlertMessage("Could not find any teams associated with your manager. Please contact your manager.");
          setShowAlert(true);
        }
      }
      
      // Invalidate and refetch all team-related queries
      await refetchTeams();
      
      // Also invalidate other team-related queries to ensure consistency
      await queryClient.invalidateQueries({ queryKey: ['user-teams'] });
      await queryClient.invalidateQueries({ queryKey: ['user-teams-profile'] });
      await queryClient.invalidateQueries({ queryKey: ['team-members'] });
      
      console.log("Teams refreshed successfully");
      
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
        await queryClient.invalidateQueries({ queryKey: ['user-teams'] });
        
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

  const toggleEditing = () => {
    setIsEditing(!isEditing);
  };

  return {
    isEditing,
    setIsEditing,
    managerEmail,
    setManagerEmail,
    managerName,
    userTeams,
    isLoadingTeams,
    fixingTeamAssociation,
    isProcessing,
    showAlert,
    alertMessage,
    handleRefreshTeams,
    handleForceTeamAssociation,
    toggleEditing
  };
};
