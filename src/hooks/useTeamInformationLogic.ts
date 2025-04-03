
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTeamAssociationService } from "@/services/team-association";
import { 
  fetchUserTeamsDirectly, 
  fetchMomentumTeams, 
  fetchTeamsThroughManager, 
  checkSpecialUserCase,
  fetchTeamsWithoutRLS
} from "./team/utils/teamFetchers";
import { useTeamRefreshOperations } from "./team/utils/teamRefreshOperations";
import { fetchManagerDetails } from "./team/utils/managerDetails";
import { supabase } from "@/integrations/supabase/client";

export const useTeamInformationLogic = (managerId?: string | null) => {
  const [isEditing, setIsEditing] = useState(false);
  const [managerEmail, setManagerEmail] = useState('');
  const [managerName, setManagerName] = useState('');
  const [fixingTeamAssociation, setFixingTeamAssociation] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  
  const { isProcessing, fixMomentumCapitolAssociation, forceAgentTeamAssociation, checkAndUpdateTeamAssociation } = useTeamAssociationService();
  const queryClient = useQueryClient();

  // Fetch user teams with improved error handling
  const { 
    data: userTeams = [], 
    isLoading: isLoadingTeams,
    refetch: refetchTeams,
  } = useQuery({
    queryKey: ['user-teams-profile-direct'],
    queryFn: async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];
        
        console.log("Fetching teams for user:", user.email);
        
        // Try various methods to get the teams
        let teams: any[] = [];
        
        // Check if this is a special case user or managed by Nielsen
        const isSpecialCase = await checkSpecialUserCase();
        const { data: profile } = await supabase
          .from('profiles')
          .select('manager_id')
          .eq('id', user.id)
          .single();
          
        if (isSpecialCase) {
          console.log("Special case detected: Nielsen or managed by Nielsen");
          // Special case: try to get Momentum teams first
          teams = await fetchMomentumTeams();
          if (teams.length > 0) {
            console.log("Successfully fetched special case teams", teams);
            return teams;
          }
        }
        
        // If user has a manager, check if the manager is Nielsen
        if (profile?.manager_id) {
          const { data: managerProfile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', profile.manager_id)
            .single();
            
          if (managerProfile && 
              (managerProfile.email === 'nielsenaragon@gmail.com' || 
               managerProfile.email === 'nielsenaragon@ymail.com')) {
            console.log("User is managed by Nielsen, trying to fetch Momentum teams");
            teams = await fetchMomentumTeams();
            if (teams.length > 0) {
              console.log("Successfully fetched Momentum teams for user managed by Nielsen", teams);
              return teams;
            }
          }
        }
        
        // Method 1: Direct fetch
        teams = await fetchUserTeamsDirectly();
        if (teams.length > 0) {
          console.log("Successfully fetched teams directly", teams);
          return teams;
        }
        
        // Method 3: Fetch through manager
        if (managerId) {
          teams = await fetchTeamsThroughManager(managerId);
          if (teams.length > 0) {
            console.log("Successfully fetched teams through manager", teams);
            return teams;
          }
        }
        
        // Method 4: Try with no RLS
        teams = await fetchTeamsWithoutRLS(user.id);
        if (teams.length > 0) {
          console.log("Successfully fetched teams without RLS", teams);
          return teams;
        }
        
        // If all methods failed, show an alert
        if (managerId) {
          setAlertMessage("Could not find any teams associated with your manager. Please contact your manager or try the Force Team Association button.");
          setShowAlert(true);
        }
        
        return [];
      } catch (error) {
        console.error("Error in team fetching process:", error);
        
        // Check if user is logged in
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];
        
        // Show alert about team association issue
        if (managerId) {
          setAlertMessage("There was a problem loading your teams. Try using the refresh button or Force Team Association.");
          setShowAlert(true);
        }
        
        // Make one more attempt with the no-RLS method
        try {
          return await fetchTeamsWithoutRLS(user.id);
        } catch (finalError) {
          console.error("Final attempt to fetch teams failed:", finalError);
          return [];
        }
      }
    },
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: 1000,
    staleTime: 1000 * 30,
    enabled: true
  });

  // Setup refresh operations
  const { handleRefreshTeams, handleForceTeamAssociation } = useTeamRefreshOperations(
    refetchTeams,
    setShowAlert,
    setAlertMessage,
    setFixingTeamAssociation
  );

  // Fetch manager details
  useEffect(() => {
    fetchManagerDetails(managerId, setManagerName, setManagerEmail);
  }, [managerId]);

  // Init special case fix
  useEffect(() => {
    const initSpecialCase = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        console.log("Checking if special case needs to be initialized for:", user.email);
        
        // Check if user is managed by Nielsen
        const { data: profile } = await supabase
          .from('profiles')
          .select('manager_id')
          .eq('id', user.id)
          .single();
          
        const isSpecialCase = await checkSpecialUserCase();
        
        // Special case 1: User is Nielsen
        if (isSpecialCase) {
          console.log("Special case initialized for Nielsen");
          await fixMomentumCapitolAssociation();
          await refetchTeams();
          return;
        }
        
        // Special case 2: User is managed by Nielsen
        if (profile?.manager_id) {
          const { data: managerProfile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', profile.manager_id)
            .single();
            
          if (managerProfile && 
              (managerProfile.email === 'nielsenaragon@gmail.com' || 
               managerProfile.email === 'nielsenaragon@ymail.com')) {
            console.log("Special case: user is managed by Nielsen");
            await fixMomentumCapitolAssociation();
            await refetchTeams();
            return;
          }
        }
      } catch (error) {
        console.error("Error in initSpecialCase:", error);
      }
    };
    
    initSpecialCase();
  }, []);

  // Check for team visibility issues and automatically try to fix them
  useEffect(() => {
    const checkTeamVisibility = async () => {
      try {
        // Only run this check if we have a manager but no teams
        if (managerId && userTeams.length === 0 && !isLoadingTeams && !fixingTeamAssociation && !isProcessing) {
          console.log("Detected potential team visibility issue - automatic fix attempt");
          
          // Get current user
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;
          
          console.log("Checking team visibility for:", user.email);
          
          // Check if user is managed by Nielsen
          const { data: managerProfile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', managerId)
            .single();
            
          if (managerProfile && 
              (managerProfile.email === 'nielsenaragon@gmail.com' || 
               managerProfile.email === 'nielsenaragon@ymail.com')) {
            console.log("Manager is Nielsen, fixing Momentum Capitol association");
            await fixMomentumCapitolAssociation();
            await refetchTeams();
          } else {
            // Standard team association
            await handleForceTeamAssociation();
          }
        }
      } catch (error) {
        console.error("Error in checkTeamVisibility:", error);
      }
    };
    
    checkTeamVisibility();
  }, [managerId, userTeams, isLoadingTeams]);

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
