
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";

type MetricSummary = {
  total_leads: number;
  total_calls: number;
  total_contacts: number;
  total_scheduled: number;
  total_sits: number;
  total_sales: number;
  average_ap: number;
};

type TeamMemberMetrics = {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  profile_image_url: string | null;
  metrics: MetricSummary;
};

export const useTeamMetrics = (teamId?: string) => {
  // Get team members with their metrics for the current month
  const { data: teamMetrics, isLoading: isLoadingTeamMetrics } = useQuery({
    queryKey: ['team-metrics', teamId],
    queryFn: async () => {
      if (!teamId) return [];

      // First get all team members
      const { data: members, error: membersError } = await supabase
        .from('team_members')
        .select(`
          user_id,
          profiles:user_id (
            first_name,
            last_name,
            email,
            profile_image_url
          )
        `)
        .eq('team_id', teamId);

      if (membersError) throw membersError;

      const today = new Date();
      const monthStart = format(startOfMonth(today), 'yyyy-MM-dd');
      const monthEnd = format(endOfMonth(today), 'yyyy-MM-dd');

      // For each member, get their metrics for the current month
      const memberMetrics = await Promise.all(
        members.map(async (member) => {
          const { data: metrics, error: metricsError } = await supabase
            .from('daily_metrics')
            .select('leads, calls, contacts, scheduled, sits, sales, ap')
            .eq('user_id', member.user_id)
            .gte('date', monthStart)
            .lte('date', monthEnd);

          if (metricsError) throw metricsError;

          // Calculate totals and averages
          const summary: MetricSummary = metrics.reduce((acc, curr) => ({
            total_leads: acc.total_leads + (curr.leads || 0),
            total_calls: acc.total_calls + (curr.calls || 0),
            total_contacts: acc.total_contacts + (curr.contacts || 0),
            total_scheduled: acc.total_scheduled + (curr.scheduled || 0),
            total_sits: acc.total_sits + (curr.sits || 0),
            total_sales: acc.total_sales + (curr.sales || 0),
            average_ap: acc.average_ap + (curr.ap || 0)
          }), {
            total_leads: 0,
            total_calls: 0,
            total_contacts: 0,
            total_scheduled: 0,
            total_sits: 0,
            total_sales: 0,
            average_ap: 0
          });

          // Calculate average AP
          summary.average_ap = metrics.length > 0 ? 
            Math.round(summary.average_ap / metrics.length) : 0;

          return {
            user_id: member.user_id,
            first_name: member.profiles?.first_name,
            last_name: member.profiles?.last_name,
            email: member.profiles?.email,
            profile_image_url: member.profiles?.profile_image_url,
            metrics: summary
          } as TeamMemberMetrics;
        })
      );

      return memberMetrics;
    },
    enabled: !!teamId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Get team performance for last 30 days
  const { data: teamTrends, isLoading: isLoadingTeamTrends } = useQuery({
    queryKey: ['team-trends', teamId],
    queryFn: async () => {
      if (!teamId) return null;

      // Get all team members
      const { data: members, error: membersError } = await supabase
        .from('team_members')
        .select('user_id')
        .eq('team_id', teamId);

      if (membersError) throw membersError;

      const userIds = members.map(m => m.user_id);
      const today = new Date();
      const thirtyDaysAgo = format(subDays(today, 30), 'yyyy-MM-dd');
      const todayStr = format(today, 'yyyy-MM-dd');

      // Get metrics for all team members in the last 30 days
      const { data: metrics, error: metricsError } = await supabase
        .from('daily_metrics')
        .select('date, leads, calls, contacts, scheduled, sits, sales, ap')
        .in('user_id', userIds)
        .gte('date', thirtyDaysAgo)
        .lte('date', todayStr)
        .order('date');

      if (metricsError) throw metricsError;

      // Group metrics by date
      const metricsByDate = metrics.reduce((acc: any, curr) => {
        if (!acc[curr.date]) {
          acc[curr.date] = {
            date: curr.date,
            leads: 0,
            calls: 0,
            contacts: 0,
            scheduled: 0,
            sits: 0,
            sales: 0,
            ap: 0,
            count: 0
          };
        }
        
        acc[curr.date].leads += (curr.leads || 0);
        acc[curr.date].calls += (curr.calls || 0);
        acc[curr.date].contacts += (curr.contacts || 0);
        acc[curr.date].scheduled += (curr.scheduled || 0);
        acc[curr.date].sits += (curr.sits || 0);
        acc[curr.date].sales += (curr.sales || 0);
        acc[curr.date].ap += (curr.ap || 0);
        acc[curr.date].count += 1;
        
        return acc;
      }, {});

      // Convert to array and calculate average AP
      const dailyMetrics = Object.values(metricsByDate).map((day: any) => ({
        ...day,
        ap: day.count > 0 ? Math.round(day.ap / day.count) : 0
      }));

      return dailyMetrics;
    },
    enabled: !!teamId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    teamMetrics,
    isLoadingTeamMetrics,
    teamTrends,
    isLoadingTeamTrends
  };
};
