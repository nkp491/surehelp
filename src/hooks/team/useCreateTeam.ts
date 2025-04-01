
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getManagerRole, addManagedUsersToTeam } from "./utils/teamUtils";

/**
 * Hook to create a new team
 */
export const useCreateTeam = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const createTeam = useMutation({
    mutationFn: async (name: string) => {
      setIsLoading(true);
      console.log("Creating new team:", name);
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');
        
        // First, create the team
        const { data: teamData, error: teamError } = await supabase
          .from('teams')
          .insert([{ name }])
          .select()
          .single();
          
        if (teamError) {
          console.error("Error creating team:", teamError);
          throw teamError;
        }
        
        console.log("Team created:", teamData);
        
        // Get the appropriate manager role
        const managerRole = await getManagerRole(user.id);
        
        // Add the user as a manager of this team
        const { error: memberError } = await supabase
          .from('team_members')
          .insert([{
            team_id: teamData.id,
            user_id: user.id,
            role: managerRole
          }]);
          
        if (memberError) {
          console.error("Error adding user to team:", memberError);
          throw memberError;
        }
        
        // Add all managed users to the team
        await addManagedUsersToTeam(user.id, teamData.id);
        
        return teamData;
      } catch (error) {
        console.error("Error in createTeam mutation:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Team creation success:", data);
      // Invalidate the teams query to refetch
      queryClient.invalidateQueries({ queryKey: ['user-teams'] });
      queryClient.invalidateQueries({ queryKey: ['user-teams-profile'] });
      
      toast({
        title: "Team created",
        description: "Your new team has been created successfully.",
      });
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Error creating team:', error);
      toast({
        title: "Error",
        description: "There was a problem creating the team. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  });

  return {
    createTeam,
    isLoading
  };
};
