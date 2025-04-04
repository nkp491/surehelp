
import { useState } from "react";
import { useTeams } from "./team/useTeams";
import { useTeamAssociationService } from "@/services/team-association";
import { useToast } from "@/hooks/use-toast";
import { useTeamRefreshOperations } from "./team/utils/teamRefreshOperations";

/**
 * Logic hook for team information component
 */
export const useTeamInformationLogic = () => {
  const { teams, isLoadingTeams, refetchTeams } = useTeams();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const { 
    forceAgentTeamAssociation, 
    fixMomentumCapitolAssociation,
    isProcessing: isFixing
  } = useTeamAssociationService();
  const { 
    invalidateTeamQueries, 
    showRefreshSuccessToast,
    showRefreshErrorToast
  } = useTeamRefreshOperations();
  
  // Refresh teams info
  const handleRefreshTeams = async () => {
    try {
      setIsUpdating(true);
      await refetchTeams();
      showRefreshSuccessToast();
    } catch (error) {
      console.error("Error refreshing teams:", error);
      showRefreshErrorToast(error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Force team association
  const handleForceTeamAssociation = async () => {
    try {
      // Use the service function that already has error handling
      const success = await forceAgentTeamAssociation();
      
      if (success) {
        // The toast is shown by the service function
        await refetchTeams();
      } else {
        // Try the legacy method as backup
        const altSuccess = await fixMomentumCapitolAssociation();
        
        if (altSuccess) {
          await refetchTeams();
        } else {
          toast({
            title: "Team Association Failed",
            description: "Could not force team association. Please contact support.",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error("Error forcing team association:", error);
      toast({
        title: "Team Association Error",
        description: "An error occurred while trying to force team association.",
        variant: "destructive"
      });
    }
  };
  
  return {
    teams,
    isLoadingTeams,
    isUpdating: isUpdating || isFixing,
    handleRefreshTeams,
    handleForceTeamAssociation
  };
};
