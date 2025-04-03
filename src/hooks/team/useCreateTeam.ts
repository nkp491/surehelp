
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
        
        // Two-step approach to handle potential RLS issues
        
        // First, try direct database operations
        try {
          // Create the team
          const { data: teamData, error: teamError } = await supabase
            .from('teams')
            .insert([{ name }])
            .select()
            .single();
            
          if (teamError) {
            console.log("Direct team creation failed, will try RPC:", teamError);
            throw teamError;
          }
          
          console.log("Team created:", teamData);
          
          // Add the user as team member
          const { data: userRoles } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .like('role', 'manager%');
          
          const managerRole = userRoles && userRoles.length > 0 
            ? userRoles[0].role 
            : 'manager_pro';
            
          const { error: memberError } = await supabase
            .from('team_members')
            .insert([{
              team_id: teamData.id,
              user_id: user.id,
              role: managerRole
            }]);
            
          if (memberError) {
            console.log("Direct member addition failed:", memberError);
            throw memberError;
          }
          
          // Also add managed users to team
          const { data: managedUsers } = await supabase
            .from('profiles')
            .select('id')
            .eq('manager_id', user.id);
            
          if (managedUsers && managedUsers.length > 0) {
            const teamMembers = managedUsers.map(u => ({
              team_id: teamData.id,
              user_id: u.id,
              role: 'agent'
            }));
            
            await supabase
              .from('team_members')
              .insert(teamMembers);
          }
          
          return teamData;
        } catch (directError) {
          // If direct approach fails, use the RPC function as fallback
          console.log("Using RPC fallback for team creation");
          
          const { data: rpcResult, error: rpcError } = await supabase
            .rpc('create_team_for_manager', { team_name: name });
            
          if (rpcError) {
            console.error("RPC team creation failed:", rpcError);
            throw rpcError;
          }
          
          if (!rpcResult.success) {
            console.error("RPC returned failure:", rpcResult.error);
            throw new Error(rpcResult.error || 'Failed to create team');
          }
          
          console.log("Team created via RPC:", rpcResult);
          
          // Return team data in the expected format
          return {
            id: rpcResult.team_id,
            name: rpcResult.team_name,
            created_at: new Date().toISOString()
          };
        }
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
