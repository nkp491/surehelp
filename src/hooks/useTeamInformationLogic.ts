
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTeamAssociationService } from "@/services/team-association";
import { 
  fetchUserTeamsDirectly, 
  fetchTeamsThroughManager, 
  fetchTeamsWithoutRLS
} from "./team/utils/teamFetchers";
import { useTeamRefreshOperations } from "./team/utils/teamRefreshOperations";
import { fetchManagerDetails } from "./team/utils/managerDetails";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useTeamInformationLogic = (managerId?: string | null) => {
  const [isEditing, setIsEditing] = useState(false);
  const [managerEmail, setManagerEmail] = useState('');
  const [managerName, setManagerName] = useState('');
  const [fixingTeamAssociation, setFixingTeamAssociation] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  
  const { isProcessing, forceAgentTeamAssociation, checkAndUpdateTeamAssociation } = useTeamAssociationService();
  const queryClient = useQueryClient();
  const { toast } = useToast();

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
        
        // Method 1: Direct fetch
        let teams = await fetchUserTeamsDirectly();
        if (teams.length > 0) {
          console.log("Successfully fetched teams directly", teams);
          return teams;
        }
        
        // Method 2: Fetch through manager
        if (managerId) {
          teams = await fetchTeamsThroughManager(managerId);
          if (teams.length > 0) {
            console.log("Successfully fetched teams through manager", teams);
            return teams;
          }
        }
        
        // Method 3: Try with no RLS
        if (user) {
          teams = await fetchTeamsWithoutRLS(user.id);
          if (teams.length > 0) {
            console.log("Successfully fetched teams without RLS", teams);
            return teams;
          }
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
        
        // Make one more attempt with bypass approach
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

  // Check for team visibility issues and automatically try to fix them
  useEffect(() => {
    const checkTeamVisibility = async () => {
      try {
        // Only run this check if we have a manager but no teams
        if (managerId && userTeams.length === 0 && !isLoadingTeams && !fixingTeamAssociation && !isProcessing) {
          console.log("Detected potential team visibility issue - automatic fix attempt");
          
          // Standard team association
          await handleForceTeamAssociation();
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
