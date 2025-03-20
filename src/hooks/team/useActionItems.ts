
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ActionItem } from "@/types/team";

/**
 * Hook to fetch and manage action items
 */
export const useActionItems = (meetingId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Get action items with assignee information
  const getMeetingActionItems = async (meetingId: string): Promise<ActionItem[]> => {
    // First, fetch the action items
    const { data: actionItems, error: actionItemsError } = await supabase
      .from('action_items')
      .select('*')
      .eq('meeting_id', meetingId)
      .order('created_at', { ascending: true });

    if (actionItemsError) throw actionItemsError;

    // Get the list of assignee IDs
    const assigneeIds = actionItems.map(item => item.assigned_to);
    
    // Fetch the profiles for these assignees
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, profile_image_url')
      .in('id', assigneeIds);
    
    if (profilesError) throw profilesError;

    // Create a map of user IDs to their profile information
    const profileMap = profiles.reduce((acc, profile) => {
      acc[profile.id] = profile;
      return acc;
    }, {} as Record<string, any>);

    // Merge the action items with assignee information
    return actionItems.map((item) => ({
      ...item,
      assignee_name: profileMap[item.assigned_to] ? 
        `${profileMap[item.assigned_to].first_name || ''} ${profileMap[item.assigned_to].last_name || ''}`.trim() : 
        'Unknown',
      assignee_image: profileMap[item.assigned_to]?.profile_image_url,
    })) as ActionItem[];
  };

  // Get action items assigned to current user
  const getUserActionItems = async (): Promise<ActionItem[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // First, fetch the action items assigned to the user
    const { data: actionItems, error: actionItemsError } = await supabase
      .from('action_items')
      .select('*')
      .eq('assigned_to', user.id)
      .is('completed_at', null)
      .order('due_date', { ascending: true });

    if (actionItemsError) throw actionItemsError;

    // Get the list of meeting IDs to fetch additional context
    const meetingIds = actionItems.map(item => item.meeting_id);
    
    // Fetch the meetings for context
    const { data: meetings, error: meetingsError } = await supabase
      .from('one_on_one_meetings')
      .select('id, title')
      .in('id', meetingIds);
    
    if (meetingsError) throw meetingsError;

    // Create a map of meeting IDs to their titles
    const meetingMap = meetings.reduce((acc, meeting) => {
      acc[meeting.id] = meeting.title;
      return acc;
    }, {} as Record<string, string>);

    // Get creator profiles
    const creatorIds = actionItems.map(item => item.created_by);
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .in('id', creatorIds);
    
    if (profilesError) throw profilesError;

    // Create a map of user IDs to their profile information
    const profileMap = profiles.reduce((acc, profile) => {
      acc[profile.id] = profile;
      return acc;
    }, {} as Record<string, any>);

    // Merge the action items with meeting and profile information
    return actionItems.map((item) => ({
      ...item,
      meeting_title: meetingMap[item.meeting_id] || 'Unknown Meeting',
      creator_name: profileMap[item.created_by] ? 
        `${profileMap[item.created_by].first_name || ''} ${profileMap[item.created_by].last_name || ''}`.trim() : 
        'Unknown',
    }));
  };

  // Query for meeting action items
  const { data: actionItems, ...actionItemsQuery } = useQuery({
    queryKey: ['meeting-action-items', meetingId],
    queryFn: () => getMeetingActionItems(meetingId!),
    enabled: !!meetingId,
  });

  // Query for user's action items
  const { data: userActionItems, ...userActionItemsQuery } = useQuery({
    queryKey: ['user-action-items'],
    queryFn: getUserActionItems,
  });

  // Create a new action item
  const createActionItem = useMutation({
    mutationFn: async ({ 
      meetingId, 
      assignedTo, 
      description, 
      dueDate 
    }: { 
      meetingId: string; 
      assignedTo: string; 
      description: string; 
      dueDate?: string;
    }) => {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('action_items')
        .insert([{
          meeting_id: meetingId,
          assigned_to: assignedTo,
          description,
          due_date: dueDate,
          created_by: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['meeting-action-items', variables.meetingId] });
      queryClient.invalidateQueries({ queryKey: ['user-action-items'] });
      toast({
        title: "Action item added",
        description: "The action item has been created.",
      });
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Error creating action item:', error);
      toast({
        title: "Error",
        description: "There was a problem creating the action item. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  });

  // Complete an action item
  const completeActionItem = useMutation({
    mutationFn: async ({ 
      actionItemId, 
      meetingId 
    }: { 
      actionItemId: string; 
      meetingId?: string;
    }) => {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('action_items')
        .update({ completed_at: new Date().toISOString() })
        .eq('id', actionItemId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      if (variables.meetingId) {
        queryClient.invalidateQueries({ queryKey: ['meeting-action-items', variables.meetingId] });
      }
      queryClient.invalidateQueries({ queryKey: ['user-action-items'] });
      toast({
        title: "Action item completed",
        description: "The action item has been marked as completed.",
      });
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Error completing action item:', error);
      toast({
        title: "Error",
        description: "There was a problem updating the action item. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  });

  // Delete an action item
  const deleteActionItem = useMutation({
    mutationFn: async ({ 
      actionItemId, 
      meetingId 
    }: { 
      actionItemId: string; 
      meetingId?: string;
    }) => {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('action_items')
        .delete()
        .eq('id', actionItemId);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: (_, variables) => {
      if (variables.meetingId) {
        queryClient.invalidateQueries({ queryKey: ['meeting-action-items', variables.meetingId] });
      }
      queryClient.invalidateQueries({ queryKey: ['user-action-items'] });
      toast({
        title: "Action item deleted",
        description: "The action item has been removed.",
      });
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Error deleting action item:', error);
      toast({
        title: "Error",
        description: "There was a problem deleting the action item. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  });

  return {
    actionItems,
    userActionItems,
    createActionItem,
    completeActionItem,
    deleteActionItem,
    isLoading,
    actionItemsQuery,
    userActionItemsQuery
  };
};
