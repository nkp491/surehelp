import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useTeamCreation = () => {
  const { toast } = useToast();

  const createTeamIfNeeded = async (userId: string) => {
    try {
      // First check if user already has a team as manager
      const { data: existingTeam, error: teamError } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', userId)
        .eq('role', 'manager')
        .maybeSingle();

      if (teamError) throw teamError;

      if (existingTeam?.team_id) {
        return existingTeam.team_id;
      }

      // Get user's profile for team name
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name')
        .eq('id', userId)
        .single();

      // Create new team
      const { data: newTeam, error: createTeamError } = await supabase
        .from('teams')
        .insert([
          { name: `${profile?.first_name || 'New'}'s Team` }
        ])
        .select()
        .single();

      if (createTeamError) throw createTeamError;

      // Add user as team manager
      const { error: memberError } = await supabase
        .from('team_members')
        .insert([
          {
            team_id: newTeam.id,
            user_id: userId,
            role: 'manager'
          }
        ]);

      if (memberError) throw memberError;

      return newTeam.id;
    } catch (error) {
      console.error('Error creating team:', error);
      throw error;
    }
  };

  return {
    createTeamIfNeeded
  };
};