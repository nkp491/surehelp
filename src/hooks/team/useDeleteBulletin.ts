
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useDeleteBulletin = (teamId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const deleteBulletin = useMutation({
    mutationFn: async (bulletinId: string) => {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('team_bulletins')
        .delete()
        .eq('id', bulletinId);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-bulletins', teamId] });
      toast({
        title: "Bulletin deleted",
        description: "The bulletin has been deleted successfully.",
      });
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Error deleting bulletin:', error);
      toast({
        title: "Error",
        description: "There was a problem deleting the bulletin. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  });

  return {
    deleteBulletin,
    isLoading
  };
};
