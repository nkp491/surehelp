
import { useTeamMetrics } from "@/hooks/useTeamMetrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Settings, EyeOff, Eye } from "lucide-react";
import { MetricCount } from "@/types/metrics";
import { TeamMemberStats } from "./TeamMemberStats";
import { TeamMetricsRatios } from "./TeamMetricsRatios";
import { useTeamHierarchy } from "@/hooks/team/useTeamHierarchy";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TeamMetricsOverviewProps {
  teamId?: string;
  includeHierarchy?: boolean;
}

export function TeamMetricsOverview({ teamId, includeHierarchy = false }: TeamMetricsOverviewProps) {
  const { teamMetrics, isLoadingTeamMetrics } = useTeamMetrics(teamId);
  const { teamHierarchy, isLoading: isLoadingHierarchy, hasGoldAccess, hasPlatinumAccess } = useTeamHierarchy(teamId);
  const [showHierarchicalData, setShowHierarchicalData] = useState(true);

  // Calculate aggregated metrics for the team
  const directTeamMetrics: MetricCount | null = teamMetrics?.length ? {
    leads: teamMetrics.reduce((sum, member) => sum + member.metrics.total_leads, 0),
    calls: teamMetrics.reduce((sum, member) => sum + member.metrics.total_calls, 0),
    contacts: teamMetrics.reduce((sum, member) => sum + member.metrics.total_contacts, 0),
    scheduled: teamMetrics.reduce((sum, member) => sum + member.metrics.total_scheduled, 0),
    sits: teamMetrics.reduce((sum, member) => sum + member.metrics.total_sits, 0),
    sales: teamMetrics.reduce((sum, member) => sum + member.metrics.total_sales, 0),
    ap: teamMetrics.reduce((sum, member) => sum + member.metrics.average_ap, 0),
  } : null;

  // Use hierarchical metrics if available and user has permission
  const hierarchicalMetrics = teamHierarchy?.aggregatedMetrics;
  const hasHierarchicalAccess = hasGoldAccess || hasPlatinumAccess;
  
  // Determine which metrics to display
  const aggregatedMetrics = includeHierarchy && showHierarchicalData && hasHierarchicalAccess
    ? hierarchicalMetrics || directTeamMetrics
    : directTeamMetrics;

  const toggleHierarchicalView = () => {
    setShowHierarchicalData(!showHierarchicalData);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Team Performance</CardTitle>
        <div className="flex space-x-2">
          {includeHierarchy && hasHierarchicalAccess && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={toggleHierarchicalView}
                  >
                    {showHierarchicalData ? (
                      <Eye className="h-5 w-5" />
                    ) : (
                      <EyeOff className="h-5 w-5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {showHierarchicalData 
                    ? "Showing hierarchical data (includes sub-teams)" 
                    : "Showing only direct team data"
                  }
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
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
              isLoading={isLoadingTeamMetrics || (includeHierarchy && isLoadingHierarchy)} 
              teamMetrics={teamMetrics} 
              aggregatedMetrics={aggregatedMetrics}
              hierarchicalView={includeHierarchy && showHierarchicalData && hasHierarchicalAccess}
            />
          </TabsContent>
          
          <TabsContent value="ratios">
            <TeamMetricsRatios 
              isLoading={isLoadingTeamMetrics || (includeHierarchy && isLoadingHierarchy)} 
              teamId={teamId} 
              aggregatedMetrics={aggregatedMetrics}
              hierarchicalView={includeHierarchy && showHierarchicalData && hasHierarchicalAccess}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
