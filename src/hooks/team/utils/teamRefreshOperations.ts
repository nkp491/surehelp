
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook for team refresh operations
 * Uses security definer functions to prevent RLS recursion issues
 */
export const useTeamRefreshOperations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  /**
   * Invalidate all team-related queries
   */
  const invalidateTeamQueries = () => {
    console.log("Invalidating all team-related queries");
    queryClient.invalidateQueries({ queryKey: ['user-teams'] });
    queryClient.invalidateQueries({ queryKey: ['user-teams-profile'] });
    queryClient.invalidateQueries({ queryKey: ['user-teams-profile-direct'] });
    queryClient.invalidateQueries({ queryKey: ['team-members'] });
    queryClient.invalidateQueries({ queryKey: ['team-members-by-team'] });
  };
  
  /**
   * Show success toast for refreshed teams
   */
  const showRefreshSuccessToast = () => {
    toast({
      title: "Teams Refreshed",
      description: "Your teams information has been refreshed.",
    });
  };
  
  /**
   * Show error toast for failed refresh
   */
  const showRefreshErrorToast = (error?: any) => {
    toast({
      title: "Refresh Failed",
      description: error?.message || "Failed to refresh teams information.",
      variant: "destructive",
    });
  };
  
  return {
    invalidateTeamQueries,
    showRefreshSuccessToast,
    showRefreshErrorToast
  };
};
