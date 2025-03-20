
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useMarkBulletinRead = (teamId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const markBulletinAsRead = useMutation({
    mutationFn: async ({ bulletinId }: { bulletinId: string }) => {
      if (!teamId) throw new Error('Team ID is required');
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // First check if user has already read this bulletin
      const { data: existingReceipt, error: checkError } = await supabase
        .from('bulletin_read_receipts')
        .select('id')
        .eq('bulletin_id', bulletinId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (checkError) throw checkError;

      // If already read, don't create another receipt
      if (existingReceipt) return existingReceipt;

      // Create a read receipt
      const { data, error } = await supabase
        .from('bulletin_read_receipts')
        .insert([{
          bulletin_id: bulletinId,
          user_id: user.id,
        }])
        .select('id')
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-bulletins', teamId] });
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Error marking bulletin as read:', error);
      toast({
        title: "Error",
        description: "There was a problem marking the bulletin as read.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  });

  return {
    markBulletinAsRead,
    isLoading
  };
};
