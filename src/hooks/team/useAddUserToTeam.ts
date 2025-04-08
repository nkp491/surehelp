
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook to add a user to a team
 */
export const useAddUserToTeam = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const addUserToTeam = useMutation({
    mutationFn: async ({ teamId, userId, role }: { teamId: string; userId: string; role: string }) => {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('team_members')
        .insert([{
          team_id: teamId,
          user_id: userId,
          role
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-teams'] });
      queryClient.invalidateQueries({ queryKey: ['user-teams-profile'] });
      queryClient.invalidateQueries({ queryKey: ['team-members', data.team_id] });
      toast({
        title: "User added to team",
        description: "The user has been added to the team successfully.",
      });
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Error adding user to team:', error);
      toast({
        title: "Error",
        description: "There was a problem adding the user to the team. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  });

  return {
    addUserToTeam,
    isLoading
  };
};
