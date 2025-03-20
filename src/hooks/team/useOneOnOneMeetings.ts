
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { OneOnOneMeeting, MeetingStatus } from "@/types/team";

/**
 * Hook to fetch and manage one-on-one meetings
 */
export const useOneOnOneMeetings = (teamId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Get all one-on-one meetings for a team with profile information
  const getTeamMeetings = async (teamId: string): Promise<OneOnOneMeeting[]> => {
    // First, fetch the meetings
    const { data: meetings, error: meetingsError } = await supabase
      .from('one_on_one_meetings')
      .select('*')
      .eq('team_id', teamId)
      .order('scheduled_at', { ascending: false });

    if (meetingsError) throw meetingsError;

    // Get the list of user IDs (creators and attendees)
    const userIds = [
      ...meetings.map(meeting => meeting.created_by),
      ...meetings.map(meeting => meeting.attendee_id)
    ];
    
    // Fetch the profiles for these users
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, profile_image_url')
      .in('id', userIds);
    
    if (profilesError) throw profilesError;

    // Create a map of user IDs to their profile information
    const profileMap = profiles.reduce((acc, profile) => {
      acc[profile.id] = profile;
      return acc;
    }, {} as Record<string, any>);

    // Merge the meetings with profile information
    return meetings.map((meeting) => ({
      ...meeting,
      creator_name: profileMap[meeting.created_by] ? 
        `${profileMap[meeting.created_by].first_name || ''} ${profileMap[meeting.created_by].last_name || ''}`.trim() : 
        'Unknown',
      creator_image: profileMap[meeting.created_by]?.profile_image_url,
      attendee_name: profileMap[meeting.attendee_id] ? 
        `${profileMap[meeting.attendee_id].first_name || ''} ${profileMap[meeting.attendee_id].last_name || ''}`.trim() : 
        'Unknown',
      attendee_image: profileMap[meeting.attendee_id]?.profile_image_url,
    })) as OneOnOneMeeting[];
  };

  // Get meetings for a specific user
  const getUserMeetings = async (): Promise<OneOnOneMeeting[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // First, fetch the meetings where user is creator or attendee
    const { data: meetings, error: meetingsError } = await supabase
      .from('one_on_one_meetings')
      .select('*')
      .or(`created_by.eq.${user.id},attendee_id.eq.${user.id}`)
      .order('scheduled_at', { ascending: false });

    if (meetingsError) throw meetingsError;

    // Get the list of user IDs (creators and attendees)
    const userIds = [
      ...meetings.map(meeting => meeting.created_by),
      ...meetings.map(meeting => meeting.attendee_id)
    ];
    
    // Fetch the profiles for these users
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, profile_image_url')
      .in('id', userIds);
    
    if (profilesError) throw profilesError;

    // Create a map of user IDs to their profile information
    const profileMap = profiles.reduce((acc, profile) => {
      acc[profile.id] = profile;
      return acc;
    }, {} as Record<string, any>);

    // Merge the meetings with profile information
    return meetings.map((meeting) => ({
      ...meeting,
      creator_name: profileMap[meeting.created_by] ? 
        `${profileMap[meeting.created_by].first_name || ''} ${profileMap[meeting.created_by].last_name || ''}`.trim() : 
        'Unknown',
      creator_image: profileMap[meeting.created_by]?.profile_image_url,
      attendee_name: profileMap[meeting.attendee_id] ? 
        `${profileMap[meeting.attendee_id].first_name || ''} ${profileMap[meeting.attendee_id].last_name || ''}`.trim() : 
        'Unknown',
      attendee_image: profileMap[meeting.attendee_id]?.profile_image_url,
    })) as OneOnOneMeeting[];
  };

  // Query for team meetings
  const { data: teamMeetings, ...teamMeetingsQuery } = useQuery({
    queryKey: ['team-meetings', teamId],
    queryFn: () => getTeamMeetings(teamId!),
    enabled: !!teamId,
  });

  // Query for user's meetings
  const { data: userMeetings, ...userMeetingsQuery } = useQuery({
    queryKey: ['user-meetings'],
    queryFn: getUserMeetings,
  });

  // Create a new meeting
  const createMeeting = useMutation({
    mutationFn: async (meetingData: {
      teamId: string;
      attendeeId: string;
      title: string;
      scheduledAt: string;
      durationMinutes: number;
      location?: string;
    }) => {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('one_on_one_meetings')
        .insert([{
          team_id: meetingData.teamId,
          created_by: user.id,
          attendee_id: meetingData.attendeeId,
          title: meetingData.title,
          scheduled_at: meetingData.scheduledAt,
          duration_minutes: meetingData.durationMinutes,
          location: meetingData.location,
          status: 'scheduled'
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['team-meetings', variables.teamId] });
      queryClient.invalidateQueries({ queryKey: ['user-meetings'] });
      toast({
        title: "Meeting created",
        description: "The one-on-one meeting has been scheduled.",
      });
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Error creating meeting:', error);
      toast({
        title: "Error",
        description: "There was a problem creating the meeting. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  });

  // Update meeting status
  const updateMeetingStatus = useMutation({
    mutationFn: async ({ 
      meetingId, 
      status, 
      teamId 
    }: { 
      meetingId: string; 
      status: MeetingStatus; 
      teamId?: string 
    }) => {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('one_on_one_meetings')
        .update({ status })
        .eq('id', meetingId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      if (variables.teamId) {
        queryClient.invalidateQueries({ queryKey: ['team-meetings', variables.teamId] });
      }
      queryClient.invalidateQueries({ queryKey: ['user-meetings'] });
      toast({
        title: "Meeting updated",
        description: `The meeting status has been updated to ${variables.status}.`,
      });
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Error updating meeting status:', error);
      toast({
        title: "Error",
        description: "There was a problem updating the meeting. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  });

  // Delete a meeting
  const deleteMeeting = useMutation({
    mutationFn: async ({ 
      meetingId, 
      teamId 
    }: { 
      meetingId: string; 
      teamId?: string 
    }) => {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('one_on_one_meetings')
        .delete()
        .eq('id', meetingId);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: (_, variables) => {
      if (variables.teamId) {
        queryClient.invalidateQueries({ queryKey: ['team-meetings', variables.teamId] });
      }
      queryClient.invalidateQueries({ queryKey: ['user-meetings'] });
      toast({
        title: "Meeting deleted",
        description: "The meeting has been removed.",
      });
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Error deleting meeting:', error);
      toast({
        title: "Error",
        description: "There was a problem deleting the meeting. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  });

  return {
    teamMeetings,
    userMeetings,
    createMeeting,
    updateMeetingStatus,
    deleteMeeting,
    isLoading,
    // query results
    teamMeetingsQuery,
    userMeetingsQuery
  };
};
