
import { useTeamMetrics } from "@/hooks/useTeamMetrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import RatiosGrid from "@/components/metrics/RatiosGrid";
import { MetricCount } from "@/types/metrics";

interface TeamMetricsOverviewProps {
  teamId?: string;
}

export function TeamMetricsOverview({ teamId }: TeamMetricsOverviewProps) {
  const { teamMetrics, isLoadingTeamMetrics } = useTeamMetrics(teamId);

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
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="members">
          <TabsList className="mb-4">
            <TabsTrigger value="members">Member Stats</TabsTrigger>
            <TabsTrigger value="ratios">Metric Ratios</TabsTrigger>
          </TabsList>
          
          <TabsContent value="members">
            {isLoadingTeamMetrics ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4 text-center">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <Skeleton key={idx} className="h-16 w-full" />
                  ))}
                </div>
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-center justify-between border p-3 rounded-md">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : teamMetrics?.length === 0 ? (
              <div className="text-center p-6">
                <p className="text-muted-foreground">No team metrics available</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4 text-center">
                  <div className="p-2 bg-muted/30 rounded-md">
                    <p className="text-xs text-muted-foreground">Leads</p>
                    <p className="font-medium text-lg">
                      {aggregatedMetrics?.leads || 0}
                    </p>
                  </div>
                  <div className="p-2 bg-muted/30 rounded-md">
                    <p className="text-xs text-muted-foreground">Calls</p>
                    <p className="font-medium text-lg">
                      {aggregatedMetrics?.calls || 0}
                    </p>
                  </div>
                  <div className="p-2 bg-muted/30 rounded-md">
                    <p className="text-xs text-muted-foreground">Contacts</p>
                    <p className="font-medium text-lg">
                      {aggregatedMetrics?.contacts || 0}
                    </p>
                  </div>
                  <div className="p-2 bg-muted/30 rounded-md">
                    <p className="text-xs text-muted-foreground">Scheduled</p>
                    <p className="font-medium text-lg">
                      {aggregatedMetrics?.scheduled || 0}
                    </p>
                  </div>
                  <div className="p-2 bg-muted/30 rounded-md">
                    <p className="text-xs text-muted-foreground">Sits</p>
                    <p className="font-medium text-lg">
                      {aggregatedMetrics?.sits || 0}
                    </p>
                  </div>
                  <div className="p-2 bg-muted/30 rounded-md">
                    <p className="text-xs text-muted-foreground">Sales</p>
                    <p className="font-medium text-lg">
                      {aggregatedMetrics?.sales || 0}
                    </p>
                  </div>
                </div>
                
                {teamMetrics?.map((member) => (
                  <div key={member.user_id} className="border rounded-md p-3">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center space-x-3">
                        <ProfileAvatar
                          imageUrl={member.profile_image_url}
                          firstName={member.first_name}
                          className="h-10 w-10"
                        />
                        <div>
                          <p className="font-medium">
                            {member.first_name} {member.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {member.email}
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <Badge variant="outline" className="ml-2">
                          AP: ${(member.metrics.average_ap / 100).toFixed(2)}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-center mt-3">
                      <div className="text-xs p-1 bg-muted/20 rounded">
                        <span className="block text-muted-foreground">Leads</span>
                        <span className="font-medium">{member.metrics.total_leads}</span>
                      </div>
                      <div className="text-xs p-1 bg-muted/20 rounded">
                        <span className="block text-muted-foreground">Calls</span>
                        <span className="font-medium">{member.metrics.total_calls}</span>
                      </div>
                      <div className="text-xs p-1 bg-muted/20 rounded">
                        <span className="block text-muted-foreground">Contacts</span>
                        <span className="font-medium">{member.metrics.total_contacts}</span>
                      </div>
                      <div className="text-xs p-1 bg-muted/20 rounded">
                        <span className="block text-muted-foreground">Scheduled</span>
                        <span className="font-medium">{member.metrics.total_scheduled}</span>
                      </div>
                      <div className="text-xs p-1 bg-muted/20 rounded">
                        <span className="block text-muted-foreground">Sits</span>
                        <span className="font-medium">{member.metrics.total_sits}</span>
                      </div>
                      <div className="text-xs p-1 bg-muted/20 rounded">
                        <span className="block text-muted-foreground">Sales</span>
                        <span className="font-medium">{member.metrics.total_sales}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="ratios">
            {isLoadingTeamMetrics ? (
              <div className="h-[300px] w-full flex items-center justify-center">
                <Skeleton className="h-full w-full" />
              </div>
            ) : !aggregatedMetrics ? (
              <div className="text-center p-6">
                <p className="text-muted-foreground">No metrics available for ratio calculation</p>
              </div>
            ) : (
              <div className="space-y-4">
                <RatiosGrid teamId={teamId} />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
