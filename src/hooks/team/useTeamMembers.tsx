import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { TeamMember } from "@/types/team";
import { useToast } from "@/hooks/use-toast";
import { useTeamCreation } from "./useTeamCreation";

export const useTeamMembers = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { createTeamIfNeeded } = useTeamCreation();

  const loadTeamMembers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileData?.role !== 'manager') {
        setIsLoading(false);
        return;
      }

      // Ensure user has a team
      const teamId = await createTeamIfNeeded(user.id);
      if (!teamId) {
        throw new Error('Failed to get or create team');
      }

      const { data: membersData, error: membersError } = await supabase
        .from('team_members')
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name,
            email
          )
        `)
        .eq('team_id', teamId);

      if (membersError) throw membersError;

      const membersWithProfiles = (membersData || []).map(member => ({
        ...member,
        profile: member.profiles || {
          first_name: null,
          last_name: null,
          email: null
        }
      }));

      const membersWithMetrics = await Promise.all(
        membersWithProfiles.map(async (member) => {
          const { data: metricsData } = await supabase
            .from('daily_metrics')
            .select('*')
            .eq('user_id', member.user_id)
            .order('date', { ascending: false })
            .limit(1)
            .single();

          return {
            ...member,
            metrics: metricsData || {
              leads: null,
              calls: null,
              contacts: null,
              scheduled: null,
              sits: null,
              sales: null,
              ap: null
            }
          } as TeamMember;
        })
      );

      setTeamMembers(membersWithMetrics);
    } catch (error) {
      console.error('Error loading team members:', error);
      toast({
        title: "Error",
        description: "Failed to load team members",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Team member removed successfully",
      });

      loadTeamMembers();
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: "Error",
        description: "Failed to remove team member",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadTeamMembers();
  }, []);

  return {
    teamMembers,
    isLoading,
    handleRemoveMember,
  };
};