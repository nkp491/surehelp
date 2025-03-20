
import { MetricCount } from "@/types/metrics";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TeamMemberRatiosProps {
  metrics: MetricCount;
}

export function TeamMemberRatios({ metrics }: TeamMemberRatiosProps) {
  // Calculate ratios based on the provided metrics
  const contactRate = metrics.leads > 0 
    ? ((metrics.contacts / metrics.leads) * 100).toFixed(1) 
    : '0';
  
  const scheduledRate = metrics.contacts > 0 
    ? ((metrics.scheduled / metrics.contacts) * 100).toFixed(1) 
    : '0';
  
  const showRate = metrics.scheduled > 0 
    ? ((metrics.sits / metrics.scheduled) * 100).toFixed(1) 
    : '0';
  
  const closeRate = metrics.sits > 0 
    ? ((metrics.sales / metrics.sits) * 100).toFixed(1) 
    : '0';

  const apPerLead = metrics.leads > 0
    ? (metrics.ap / 100 / metrics.leads).toFixed(2)
    : '0.00';

  const apPerSale = metrics.sales > 0
    ? (metrics.ap / 100 / metrics.sales).toFixed(2)
    : '0.00';

  return (
    <Card className="bg-gray-50 border-0">
      <CardContent className="p-3">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-center">
          <div className="bg-muted/30 rounded-md p-2">
            <div className="text-xs text-muted-foreground mb-1">Contact Rate</div>
            <div className="font-medium text-sm">{contactRate}%</div>
          </div>
          
          <div className="bg-muted/30 rounded-md p-2">
            <div className="text-xs text-muted-foreground mb-1">Schedule Rate</div>
            <div className="font-medium text-sm">{scheduledRate}%</div>
          </div>
          
          <div className="bg-muted/30 rounded-md p-2">
            <div className="text-xs text-muted-foreground mb-1">Show Rate</div>
            <div className="font-medium text-sm">{showRate}%</div>
          </div>
          
          <div className="bg-muted/30 rounded-md p-2">
            <div className="text-xs text-muted-foreground mb-1">Close Rate</div>
            <div className="font-medium text-sm">{closeRate}%</div>
          </div>
          
          <div className="bg-muted/30 rounded-md p-2">
            <div className="text-xs text-muted-foreground mb-1">AP/Lead</div>
            <div className="font-medium text-sm">${apPerLead}</div>
          </div>
          
          <div className="bg-muted/30 rounded-md p-2">
            <div className="text-xs text-muted-foreground mb-1">AP/Sale</div>
            <div className="font-medium text-sm">${apPerSale}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
