
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useCreateBulletin = (teamId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const createBulletin = useMutation({
    mutationFn: async ({ 
      title, 
      content, 
      pinned = false,
      category,
      mentioned_users = []
    }: { 
      title: string; 
      content: string; 
      pinned?: boolean;
      category?: string;
      mentioned_users?: string[];
    }) => {
      if (!teamId) throw new Error('Team ID is required');
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('team_bulletins')
        .insert([{
          team_id: teamId,
          created_by: user.id,
          title,
          content,
          pinned,
          category,
          mentioned_users
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-bulletins', teamId] });
      toast({
        title: "Bulletin created",
        description: "Your bulletin has been posted successfully.",
      });
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Error creating bulletin:', error);
      toast({
        title: "Error",
        description: "There was a problem posting your bulletin. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  });

  return {
    createBulletin,
    isLoading
  };
};
