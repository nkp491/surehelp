
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MeetingFollowup } from "@/types/team";

/**
 * Hook to fetch and manage meeting followups
 */
export const useMeetingFollowups = (meetingId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Get meeting followups
  const getMeetingFollowups = async (meetingId: string): Promise<MeetingFollowup[]> => {
    const { data: followups, error } = await supabase
      .from('meeting_followups')
      .select('*')
      .eq('meeting_id', meetingId)
      .order('reminder_at', { ascending: true });

    if (error) throw error;
    return followups as MeetingFollowup[];
  };

  // Query for meeting followups
  const { data: followups, ...followupsQuery } = useQuery({
    queryKey: ['meeting-followups', meetingId],
    queryFn: () => getMeetingFollowups(meetingId!),
    enabled: !!meetingId,
  });

  // Create a new followup
  const createFollowup = useMutation({
    mutationFn: async ({ 
      meetingId, 
      reminderAt, 
      message 
    }: { 
      meetingId: string; 
      reminderAt: string; 
      message?: string;
    }) => {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('meeting_followups')
        .insert([{
          meeting_id: meetingId,
          reminder_at: reminderAt,
          message,
          created_by: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['meeting-followups', variables.meetingId] });
      toast({
        title: "Followup scheduled",
        description: "The meeting followup has been scheduled.",
      });
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Error creating followup:', error);
      toast({
        title: "Error",
        description: "There was a problem scheduling the followup. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  });

  // Update followup reminder status
  const updateFollowupStatus = useMutation({
    mutationFn: async ({ 
      followupId, 
      reminderSent,
      meetingId 
    }: { 
      followupId: string; 
      reminderSent: boolean;
      meetingId: string; 
    }) => {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('meeting_followups')
        .update({ reminder_sent: reminderSent })
        .eq('id', followupId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['meeting-followups', variables.meetingId] });
      toast({
        title: "Followup updated",
        description: `The followup has been marked as ${variables.reminderSent ? 'sent' : 'not sent'}.`,
      });
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Error updating followup status:', error);
      toast({
        title: "Error",
        description: "There was a problem updating the followup. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  });

  // Delete a followup
  const deleteFollowup = useMutation({
    mutationFn: async ({ 
      followupId, 
      meetingId 
    }: { 
      followupId: string; 
      meetingId: string;
    }) => {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('meeting_followups')
        .delete()
        .eq('id', followupId);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['meeting-followups', variables.meetingId] });
      toast({
        title: "Followup deleted",
        description: "The followup has been removed.",
      });
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Error deleting followup:', error);
      toast({
        title: "Error",
        description: "There was a problem deleting the followup. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  });

  return {
    followups,
    createFollowup,
    updateFollowupStatus,
    deleteFollowup,
    isLoading,
    followupsQuery
  };
};
