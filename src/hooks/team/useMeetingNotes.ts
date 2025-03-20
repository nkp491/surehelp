
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MeetingNote } from "@/types/team";

/**
 * Hook to fetch and manage meeting notes
 */
export const useMeetingNotes = (meetingId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Get meeting notes with author information
  const getMeetingNotes = async (meetingId: string): Promise<MeetingNote[]> => {
    // First, fetch the notes
    const { data: notes, error: notesError } = await supabase
      .from('meeting_notes')
      .select('*')
      .eq('meeting_id', meetingId)
      .order('created_at', { ascending: true });

    if (notesError) throw notesError;

    // Get the list of author IDs
    const authorIds = notes.map(note => note.created_by);
    
    // Fetch the profiles for these authors
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .in('id', authorIds);
    
    if (profilesError) throw profilesError;

    // Create a map of user IDs to their profile information
    const profileMap = profiles.reduce((acc, profile) => {
      acc[profile.id] = profile;
      return acc;
    }, {} as Record<string, any>);

    // Merge the notes with author information
    return notes.map((note) => ({
      ...note,
      author_name: profileMap[note.created_by] ? 
        `${profileMap[note.created_by].first_name || ''} ${profileMap[note.created_by].last_name || ''}`.trim() : 
        'Unknown',
    })) as MeetingNote[];
  };

  // Query for meeting notes
  const { data: notes, ...notesQuery } = useQuery({
    queryKey: ['meeting-notes', meetingId],
    queryFn: () => getMeetingNotes(meetingId!),
    enabled: !!meetingId,
  });

  // Create a new note
  const createNote = useMutation({
    mutationFn: async ({ meetingId, content }: { meetingId: string; content: string }) => {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('meeting_notes')
        .insert([{
          meeting_id: meetingId,
          content,
          created_by: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['meeting-notes', variables.meetingId] });
      toast({
        title: "Note added",
        description: "Your note has been saved.",
      });
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Error creating note:', error);
      toast({
        title: "Error",
        description: "There was a problem saving your note. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  });

  // Update a note
  const updateNote = useMutation({
    mutationFn: async ({ 
      noteId, 
      content,
      meetingId
    }: { 
      noteId: string; 
      content: string;
      meetingId: string;
    }) => {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('meeting_notes')
        .update({ content })
        .eq('id', noteId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['meeting-notes', variables.meetingId] });
      toast({
        title: "Note updated",
        description: "Your note has been updated.",
      });
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Error updating note:', error);
      toast({
        title: "Error",
        description: "There was a problem updating your note. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  });

  // Delete a note
  const deleteNote = useMutation({
    mutationFn: async ({ 
      noteId, 
      meetingId 
    }: { 
      noteId: string; 
      meetingId: string;
    }) => {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('meeting_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['meeting-notes', variables.meetingId] });
      toast({
        title: "Note deleted",
        description: "Your note has been removed.",
      });
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Error deleting note:', error);
      toast({
        title: "Error",
        description: "There was a problem deleting your note. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  });

  return {
    notes,
    createNote,
    updateNote,
    deleteNote,
    isLoading,
    notesQuery
  };
};
