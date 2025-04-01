
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook for team member management operations
 */
export const useTeamMemberOperations = (onSuccess?: () => Promise<void>) => {
  const { toast } = useToast();

  // Update a team member's manager
  const updateTeamMemberManager = useMutation({
    mutationFn: async ({ memberId, newManagerId }: { memberId: string, newManagerId: string | null }) => {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ manager_id: newManagerId })
          .eq('id', memberId);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: newManagerId 
            ? "Team member has been assigned to a new manager." 
            : "Team member has been removed from your team.",
        });
        
        if (onSuccess) await onSuccess();
        return true;
      } catch (error: any) {
        console.error("Error updating team member:", error.message);
        toast({
          title: "Error",
          description: "Failed to update team member. Please try again.",
          variant: "destructive",
        });
        return false;
      }
    }
  });

  return {
    updateTeamMemberManager: updateTeamMemberManager.mutate,
    isUpdating: updateTeamMemberManager.isPending
  };
};
