
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/profile";
import { toast } from "@/hooks/use-toast";

export const useManagerTeam = (managerId?: string) => {
  // Get all team members where manager_id = managerId
  const { data: teamMembers, isLoading, error, refetch } = useQuery({
    queryKey: ['manager-team', managerId],
    queryFn: async () => {
      if (!managerId) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('manager_id', managerId);

      if (error) throw error;
      return data as Profile[];
    },
    enabled: !!managerId,
  });

  // Update a team member's manager
  const updateTeamMemberManager = async (memberId: string, newManagerId: string | null) => {
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
      
      refetch();
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
  };

  return {
    teamMembers,
    isLoading,
    error,
    updateTeamMemberManager,
    refetch
  };
};
