
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useUpdateBulletin = (teamId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const updateBulletin = useMutation({
    mutationFn: async ({ 
      bulletinId, 
      title, 
      content, 
      pinned 
    }: { 
      bulletinId: string; 
      title?: string; 
      content?: string; 
      pinned?: boolean 
    }) => {
      setIsLoading(true);
      
      const updates: any = {};
      if (title !== undefined) updates.title = title;
      if (content !== undefined) updates.content = content;
      if (pinned !== undefined) updates.pinned = pinned;

      const { data, error } = await supabase
        .from('team_bulletins')
        .update(updates)
        .eq('id', bulletinId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-bulletins', teamId] });
      toast({
        title: "Bulletin updated",
        description: "The bulletin has been updated successfully.",
      });
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Error updating bulletin:', error);
      toast({
        title: "Error",
        description: "There was a problem updating the bulletin. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  });

  return {
    updateBulletin,
    isLoading
  };
};
