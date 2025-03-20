
import { useTeamMetrics } from "@/hooks/useTeamMetrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { MetricCount } from "@/types/metrics";
import { TeamMemberStats } from "./TeamMemberStats";
import { TeamMetricsRatios } from "./TeamMetricsRatios";
import { useState } from "react";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { format, subDays } from "date-fns";

interface TeamMetricsOverviewProps {
  teamId?: string;
}

export function TeamMetricsOverview({ teamId }: TeamMetricsOverviewProps) {
  // Date range state for filtering metrics
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const { teamMetrics, isLoadingTeamMetrics } = useTeamMetrics(teamId, {
    fromDate: format(dateRange.from, 'yyyy-MM-dd'),
    toDate: format(dateRange.to, 'yyyy-MM-dd')
  });

  // Calculate aggregated metrics for the team
  const aggregatedMetrics: MetricCount | null = teamMetrics?.length ? {
    leads: teamMetrics.reduce((sum, member) => sum + member.metrics.total_leads, 0),
    calls: teamMetrics.reduce((sum, member) => sum + member.metrics.total_calls, 0),
    contacts: teamMetrics.reduce((sum, member) => sum + member.metrics.total_contacts, 0),
    scheduled: teamMetrics.reduce((sum, member) => sum + member.metrics.total_scheduled, 0),
    sits: teamMetrics.reduce((sum, member) => sum + member.metrics.total_sits, 0),
    sales: teamMetrics.reduce((sum, member) => sum + member.metrics.total_sales, 0),
    ap: teamMetrics.reduce((sum, member) => sum + member.metrics.average_ap, 0),
  } : null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Team Performance</CardTitle>
        <div className="flex items-center gap-2">
          <DateRangePicker 
            value={dateRange} 
            onChange={setDateRange} 
          />
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="members">
          <TabsList className="mb-4">
            <TabsTrigger value="members">Member Stats</TabsTrigger>
            <TabsTrigger value="ratios">Metric Ratios</TabsTrigger>
          </TabsList>
          
          <TabsContent value="members">
            <TeamMemberStats 
              isLoading={isLoadingTeamMetrics} 
              teamMetrics={teamMetrics} 
              aggregatedMetrics={aggregatedMetrics} 
            />
          </TabsContent>
          
          <TabsContent value="ratios">
            <TeamMetricsRatios 
              isLoading={isLoadingTeamMetrics} 
              teamId={teamId} 
              aggregatedMetrics={aggregatedMetrics} 
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
