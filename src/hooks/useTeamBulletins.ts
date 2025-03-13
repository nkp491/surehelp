
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TeamBulletin } from "@/types/team";

export const useTeamBulletins = (teamId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Get team bulletins with author information
  const { data: bulletins, isLoading: isLoadingBulletins } = useQuery({
    queryKey: ['team-bulletins', teamId],
    queryFn: async () => {
      if (!teamId) return [];

      const { data, error } = await supabase
        .from('team_bulletins')
        .select(`
          *,
          profiles:created_by (
            first_name,
            last_name,
            profile_image_url
          )
        `)
        .eq('team_id', teamId)
        .order('pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Flatten the structure
      return data.map((bulletin) => ({
        ...bulletin,
        author_name: bulletin.profiles ? 
          `${bulletin.profiles.first_name || ''} ${bulletin.profiles.last_name || ''}`.trim() : 
          'Unknown',
        author_image: bulletin.profiles?.profile_image_url
      })) as TeamBulletin[];
    },
    enabled: !!teamId,
  });

  // Create a new bulletin
  const createBulletin = useMutation({
    mutationFn: async ({ title, content, pinned = false }: { title: string; content: string; pinned?: boolean }) => {
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
          pinned
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

  // Update an existing bulletin
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

  // Toggle bulletin pin status
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

  // Delete a bulletin
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
    bulletins,
    isLoadingBulletins,
    isLoading,
    createBulletin,
    updateBulletin,
    toggleBulletinPin,
    deleteBulletin
  };
};
