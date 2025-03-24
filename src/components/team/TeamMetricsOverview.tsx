
import { Card } from "@/components/ui/card";

interface TeamMetricsOverviewProps {
  teamId: string;
}

export function TeamMetricsOverview({ teamId }: TeamMetricsOverviewProps) {
  return (
    <Card className="p-4">
      <h3 className="text-lg font-medium mb-2">Team Performance Metrics</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-muted p-3 rounded-md">
          <div className="text-sm text-muted-foreground">Sales</div>
          <div className="text-xl font-bold">--</div>
        </div>
        <div className="bg-muted p-3 rounded-md">
          <div className="text-sm text-muted-foreground">Leads</div>
          <div className="text-xl font-bold">--</div>
        </div>
        <div className="bg-muted p-3 rounded-md">
          <div className="text-sm text-muted-foreground">Avg. Annual Premium</div>
          <div className="text-xl font-bold">$--</div>
        </div>
      </div>
      <div className="text-xs text-muted-foreground mt-3 text-center">
        Select a time period to view metrics
      </div>
    </Card>
  );
}
