
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export const useSpecialTeamAssociations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  /**
   * Legacy method kept for backward compatibility
   * This now simply forces team association with the user's manager
   */
  const fixMomentumCapitolAssociation = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      console.log("Forcing team association for", user.email);
      
      // Use the standard function for team association
      const { data, error } = await supabase.rpc(
        'force_agent_team_association' as any,
        { agent_id: user.id }
      );
      
      if (error) {
        console.error("Error in force_agent_team_association:", error);
        return false;
      }
      
      // Refresh all team-related queries
      queryClient.invalidateQueries({ queryKey: ['user-teams'] });
      queryClient.invalidateQueries({ queryKey: ['user-teams-profile'] });
      queryClient.invalidateQueries({ queryKey: ['user-teams-profile-direct'] });
      
      if (data) {
        toast({
          title: "Team Association Updated",
          description: "You've been added to your manager's teams.",
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error in fixMomentumCapitolAssociation:", error);
      return false;
    }
  };

  return {
    fixMomentumCapitolAssociation
  };
};
