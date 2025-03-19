
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays } from "date-fns";

export interface TeamMemberMetrics {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  profile_image_url: string | null;
  metrics: {
    total_leads: number;
    total_calls: number;
    total_contacts: number;
    total_scheduled: number;
    total_sits: number;
    total_sales: number;
    average_ap: number;
  };
}

export interface TeamTrend {
  date: string;
  leads: number;
  calls: number;
  contacts: number;
  scheduled: number;
  sits: number;
  sales: number;
}

export const useTeamMetrics = (teamId?: string) => {
  // Query to fetch team member metrics
  const { data: teamMetrics, isLoading: isLoadingTeamMetrics } = useQuery({
    queryKey: ['team-metrics', teamId],
    queryFn: async (): Promise<TeamMemberMetrics[]> => {
      if (!teamId) return [];
      
      // For now, return mock data
      // In a real implementation, you would fetch this data from your API
      return mockTeamMetrics;
    },
    enabled: !!teamId,
  });

  // Query to fetch team trends over time
  const { data: teamTrends, isLoading: isLoadingTeamTrends } = useQuery({
    queryKey: ['team-trends', teamId],
    queryFn: async (): Promise<TeamTrend[]> => {
      if (!teamId) return [];
      
      // For now, return mock data
      // In a real implementation, you would fetch this data from your API
      return mockTeamTrends;
    },
    enabled: !!teamId,
  });

  return {
    teamMetrics,
    isLoadingTeamMetrics,
    teamTrends,
    isLoadingTeamTrends,
  };
};

// Mock data for development
const mockTeamMetrics: TeamMemberMetrics[] = [
  {
    user_id: "1",
    first_name: "John",
    last_name: "Smith",
    email: "john@example.com",
    profile_image_url: null,
    metrics: {
      total_leads: 45,
      total_calls: 120,
      total_contacts: 78,
      total_scheduled: 25,
      total_sits: 18,
      total_sales: 12,
      average_ap: 32500,
    },
  },
  {
    user_id: "2",
    first_name: "Sarah",
    last_name: "Johnson",
    email: "sarah@example.com",
    profile_image_url: null,
    metrics: {
      total_leads: 38,
      total_calls: 95,
      total_contacts: 62,
      total_scheduled: 22,
      total_sits: 15,
      total_sales: 9,
      average_ap: 28750,
    },
  },
  {
    user_id: "3",
    first_name: "Michael",
    last_name: "Brown",
    email: "michael@example.com",
    profile_image_url: null,
    metrics: {
      total_leads: 52,
      total_calls: 135,
      total_contacts: 88,
      total_scheduled: 30,
      total_sits: 22,
      total_sales: 15,
      average_ap: 36200,
    },
  },
];

// Generate mock trend data for the past 14 days
const mockTeamTrends: TeamTrend[] = Array.from({ length: 14 }, (_, i) => {
  const date = subDays(new Date(), 13 - i);
  return {
    date: format(date, 'yyyy-MM-dd'),
    leads: Math.floor(Math.random() * 10) + 5,
    calls: Math.floor(Math.random() * 25) + 15,
    contacts: Math.floor(Math.random() * 15) + 5,
    scheduled: Math.floor(Math.random() * 8) + 2,
    sits: Math.floor(Math.random() * 5) + 1,
    sales: Math.floor(Math.random() * 3) + 0,
  };
});
