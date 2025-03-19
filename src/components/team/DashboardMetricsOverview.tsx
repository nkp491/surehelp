
import { useTeamMetrics } from "@/hooks/useTeamMetrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format } from "date-fns";

interface DashboardMetricsOverviewProps {
  teamId?: string;
}

export function DashboardMetricsOverview({ teamId }: DashboardMetricsOverviewProps) {
  const { teamMetrics, isLoadingTeamMetrics, teamTrends, isLoadingTeamTrends } = useTeamMetrics(teamId);

  // Format date for x-axis
  const formatXAxis = (dateStr: string) => {
    return format(new Date(dateStr), "MMM d");
  };

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-2 border rounded-md shadow-sm">
          <p className="font-medium">{format(new Date(label), "MMMM d, yyyy")}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Team Performance</CardTitle>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Team KPIs */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-center">
            <div className="p-2 bg-muted/30 rounded-md">
              <p className="text-xs text-muted-foreground">Leads</p>
              <p className="font-medium">
                {isLoadingTeamMetrics ? (
                  <Skeleton className="h-4 w-12 mx-auto" />
                ) : (
                  teamMetrics?.reduce((sum, member) => sum + member.metrics.total_leads, 0) || 0
                )}
              </p>
            </div>
            <div className="p-2 bg-muted/30 rounded-md">
              <p className="text-xs text-muted-foreground">Calls</p>
              <p className="font-medium">
                {isLoadingTeamMetrics ? (
                  <Skeleton className="h-4 w-12 mx-auto" />
                ) : (
                  teamMetrics?.reduce((sum, member) => sum + member.metrics.total_calls, 0) || 0
                )}
              </p>
            </div>
            <div className="p-2 bg-muted/30 rounded-md">
              <p className="text-xs text-muted-foreground">Contacts</p>
              <p className="font-medium">
                {isLoadingTeamMetrics ? (
                  <Skeleton className="h-4 w-12 mx-auto" />
                ) : (
                  teamMetrics?.reduce((sum, member) => sum + member.metrics.total_contacts, 0) || 0
                )}
              </p>
            </div>
            <div className="p-2 bg-muted/30 rounded-md">
              <p className="text-xs text-muted-foreground">Scheduled</p>
              <p className="font-medium">
                {isLoadingTeamMetrics ? (
                  <Skeleton className="h-4 w-12 mx-auto" />
                ) : (
                  teamMetrics?.reduce((sum, member) => sum + member.metrics.total_scheduled, 0) || 0
                )}
              </p>
            </div>
            <div className="p-2 bg-muted/30 rounded-md">
              <p className="text-xs text-muted-foreground">Sits</p>
              <p className="font-medium">
                {isLoadingTeamMetrics ? (
                  <Skeleton className="h-4 w-12 mx-auto" />
                ) : (
                  teamMetrics?.reduce((sum, member) => sum + member.metrics.total_sits, 0) || 0
                )}
              </p>
            </div>
            <div className="p-2 bg-muted/30 rounded-md">
              <p className="text-xs text-muted-foreground">Sales</p>
              <p className="font-medium">
                {isLoadingTeamMetrics ? (
                  <Skeleton className="h-4 w-12 mx-auto" />
                ) : (
                  teamMetrics?.reduce((sum, member) => sum + member.metrics.total_sales, 0) || 0
                )}
              </p>
            </div>
          </div>
          
          {/* Performance Trends Chart */}
          <div className="h-[250px] w-full mt-4">
            {isLoadingTeamTrends ? (
              <div className="h-full w-full flex items-center justify-center">
                <Skeleton className="h-full w-full" />
              </div>
            ) : !teamTrends || teamTrends.length === 0 ? (
              <div className="text-center p-6 h-full flex items-center justify-center">
                <p className="text-muted-foreground">No trend data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={teamTrends}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatXAxis}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="leads"
                    stroke="#8884d8"
                    activeDot={{ r: 6 }}
                    name="Leads"
                  />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#82ca9d"
                    activeDot={{ r: 6 }}
                    name="Sales"
                  />
                  <Line
                    type="monotone"
                    dataKey="sits"
                    stroke="#ffc658"
                    activeDot={{ r: 6 }}
                    name="Sits"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
          
          {/* Top Performers */}
          {!isLoadingTeamMetrics && teamMetrics && teamMetrics.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Top Performers</h3>
              <div className="space-y-2">
                {[...teamMetrics]
                  .sort((a, b) => b.metrics.total_sales - a.metrics.total_sales)
                  .slice(0, 3)
                  .map((member) => (
                    <div key={member.user_id} className="border rounded-md p-2 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <ProfileAvatar
                          imageUrl={member.profile_image_url}
                          firstName={member.first_name}
                          className="h-8 w-8"
                        />
                        <div>
                          <p className="font-medium text-sm">
                            {member.first_name} {member.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {member.metrics.total_sales} sales
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="ml-2">
                        ${(member.metrics.average_ap / 100).toFixed(2)} AP
                      </Badge>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
