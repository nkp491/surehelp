
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTeamAssociationService } from "@/services/team-association";
import { 
  fetchUserTeamsDirectly, 
  fetchMomentumTeams, 
  fetchTeamsThroughManager, 
  checkSpecialUserCase 
} from "./team/utils/teamFetchers";
import { useTeamRefreshOperations } from "./team/utils/teamRefreshOperations";
import { fetchManagerDetails } from "./team/utils/managerDetails";

export const useTeamInformationLogic = (managerId?: string | null) => {
  const [isEditing, setIsEditing] = useState(false);
  const [managerEmail, setManagerEmail] = useState('');
  const [managerName, setManagerName] = useState('');
  const [fixingTeamAssociation, setFixingTeamAssociation] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  
  const { isProcessing, fixMomentumCapitolAssociation } = useTeamAssociationService();
  const queryClient = useQueryClient();

  // Fetch user teams
  const { 
    data: userTeams = [], 
    isLoading: isLoadingTeams,
    refetch: refetchTeams,
  } = useQuery({
    queryKey: ['user-teams-profile-direct'],
    queryFn: async () => {
      try {
        // Try to fetch teams directly first
        const teams = await fetchUserTeamsDirectly();
        
        if (teams.length > 0) {
          return teams;
        }
        
        // If no teams were found, try special cases
        if (await checkSpecialUserCase()) {
          return await fetchMomentumTeams();
        }
        
        // Try to find teams through the manager
        if (managerId) {
          return await fetchTeamsThroughManager(managerId);
        }
        
        return [];
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
    fixMomentumCapitolAssociation();
  }, []);

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
