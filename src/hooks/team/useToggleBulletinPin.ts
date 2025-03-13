
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useToggleBulletinPin = (teamId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const toggleBulletinPin = useMutation({
    mutationFn: async ({ bulletinId, pinned }: { bulletinId: string; pinned: boolean }) => {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('team_bulletins')
        .update({ pinned })
        .eq('id', bulletinId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['team-bulletins', teamId] });
      toast({
        title: data.pinned ? "Bulletin pinned" : "Bulletin unpinned",
        description: data.pinned ? 
          "The bulletin has been pinned to the top." : 
          "The bulletin has been unpinned.",
      });
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Error toggling bulletin pin:', error);
      toast({
        title: "Error",
        description: "There was a problem updating the bulletin. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  });

  return {
    toggleBulletinPin,
    isLoading
  };
};
