
import { useState } from "react";
import { useTeamAssociationCore } from "./core";

export const useTeamAssociationService = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const coreService = useTeamAssociationCore(setIsProcessing);

  /**
   * Forces a team association check for the current user with their manager
   */
  const forceAgentTeamAssociation = async (): Promise<boolean> => {
    setIsProcessing(true);
    try {
      const { data: { user } } = await coreService.supabase.auth.getUser();
      if (!user) return false;
      
      console.log("Forcing team association for user:", user.id);
      
      // Use the secure function
      const { data, error } = await coreService.supabase.rpc(
        'force_agent_team_association' as any,
        { agent_id: user.id }
      );
      
      if (error) {
        console.error("Error in force_agent_team_association:", error);
        // Fall back to older methods if the secure function fails
        return await coreService.addUserToTeamsByManager(user.id, null);
      }
      
      if (data) {
        console.log("Successfully associated user with teams via secure function");
        coreService.invalidateTeamQueries();
        return true;
      }
      
      // Fall back to the core service if needed
      return await coreService.addUserToTeamsByManager(user.id, null);
    } catch (error) {
      console.error("Error in forceAgentTeamAssociation:", error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Checks and updates team associations for the user
   */
  const checkAndUpdateTeamAssociation = async (managerId?: string): Promise<boolean> => {
    if (!managerId) return false;
    
    setIsProcessing(true);
    try {
      const { data: { user } } = await coreService.supabase.auth.getUser();
      if (!user) return false;
      
      // Use the secure function
      const { data, error } = await coreService.supabase.rpc(
        'add_user_to_manager_teams' as any,
        { user_id: user.id, manager_id: managerId }
      );
      
      if (error) {
        console.error("Error in add_user_to_manager_teams:", error);
        // Fall back to older methods
        return await coreService.checkAndUpdateTeamAssociation(managerId);
      }
      
      if (data) {
        console.log("Successfully associated user with manager's teams via secure function");
        coreService.invalidateTeamQueries();
        coreService.showSuccessToast();
        return true;
      }
      
      // Fall back to the core service
      return await coreService.checkAndUpdateTeamAssociation(managerId);
    } catch (error) {
      console.error("Error in checkAndUpdateTeamAssociation:", error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Add a user to their manager's teams
   */
  const addUserToManagerTeams = async (userId: string, managerId: string): Promise<boolean> => {
    setIsProcessing(true);
    try {
      // Use the secure function
      const { data, error } = await coreService.supabase.rpc(
        'add_user_to_manager_teams' as any,
        { user_id: userId, manager_id: managerId }
      );
      
      if (error) {
        console.error("Error in add_user_to_manager_teams:", error);
        // Fall back to older method
        return await coreService.addUserToTeamsByManager(userId, managerId);
      }
      
      if (data) {
        console.log("Successfully associated user with manager's teams via secure function");
        coreService.invalidateTeamQueries();
        coreService.showSuccessToast();
        return true;
      }
      
      // Fall back to the core service
      return await coreService.addUserToTeamsByManager(userId, managerId);
    } catch (error) {
      console.error("Error in addUserToManagerTeams:", error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    addUserToManagerTeams,
    checkAndUpdateTeamAssociation,
    forceAgentTeamAssociation
  };
};
