
import { TeamMemberMetrics } from "@/hooks/useTeamMetrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { Calculator } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TeamMemberSuccessCalculatorProps {
  userId: string;
  metrics: TeamMemberMetrics['metrics'];
}

export function TeamMemberSuccessCalculator({ 
  userId, 
  metrics 
}: TeamMemberSuccessCalculatorProps) {
  // Starting values based on current metrics
  const [leads, setLeads] = useState(metrics.total_leads);
  const [contactRate, setContactRate] = useState(
    metrics.total_leads > 0 ? (metrics.total_contacts / metrics.total_leads) * 100 : 30
  );
  const [scheduledRate, setScheduledRate] = useState(
    metrics.total_contacts > 0 ? (metrics.total_scheduled / metrics.total_contacts) * 100 : 40
  );
  const [sitRate, setSitRate] = useState(
    metrics.total_scheduled > 0 ? (metrics.total_sits / metrics.total_scheduled) * 100 : 60
  );
  const [closeRate, setCloseRate] = useState(
    metrics.total_sits > 0 ? (metrics.total_sales / metrics.total_sits) * 100 : 50
  );
  
  // Calculate projected results
  const projectedContacts = Math.round(leads * (contactRate / 100));
  const projectedScheduled = Math.round(projectedContacts * (scheduledRate / 100));
  const projectedSits = Math.round(projectedScheduled * (sitRate / 100));
  const projectedSales = Math.round(projectedSits * (closeRate / 100));
  
  // Calculate average AP per sale
  const averageAPPerSale = metrics.total_sales > 0 
    ? metrics.average_ap / metrics.total_sales 
    : metrics.average_ap;
  
  // Calculate projected AP
  const projectedAP = projectedSales * averageAPPerSale;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          <Calculator className="h-4 w-4 mr-2" />
          Success Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor={`leads-${userId}`} className="text-xs">Leads</Label>
              <span className="text-xs font-medium">{leads}</span>
            </div>
            <Slider
              id={`leads-${userId}`}
              min={5}
              max={100}
              step={1}
              value={[leads]}
              onValueChange={(vals) => setLeads(vals[0])}
              className="py-1"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor={`contact-rate-${userId}`} className="text-xs">Contact Rate (%)</Label>
              <span className="text-xs font-medium">{contactRate.toFixed(1)}%</span>
            </div>
            <Slider
              id={`contact-rate-${userId}`}
              min={10}
              max={90}
              step={1}
              value={[contactRate]}
              onValueChange={(vals) => setContactRate(vals[0])}
              className="py-1"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor={`scheduled-rate-${userId}`} className="text-xs">Contact to Scheduled (%)</Label>
              <span className="text-xs font-medium">{scheduledRate.toFixed(1)}%</span>
            </div>
            <Slider
              id={`scheduled-rate-${userId}`}
              min={10}
              max={90}
              step={1}
              value={[scheduledRate]}
              onValueChange={(vals) => setScheduledRate(vals[0])}
              className="py-1"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor={`sit-rate-${userId}`} className="text-xs">Show Rate (%)</Label>
              <span className="text-xs font-medium">{sitRate.toFixed(1)}%</span>
            </div>
            <Slider
              id={`sit-rate-${userId}`}
              min={20}
              max={95}
              step={1}
              value={[sitRate]}
              onValueChange={(vals) => setSitRate(vals[0])}
              className="py-1"
            />
          </div>
          
          <div className="space-y-2 col-span-2">
            <div className="flex justify-between">
              <Label htmlFor={`close-rate-${userId}`} className="text-xs">Close Rate (%)</Label>
              <span className="text-xs font-medium">{closeRate.toFixed(1)}%</span>
            </div>
            <Slider
              id={`close-rate-${userId}`}
              min={10}
              max={80}
              step={1}
              value={[closeRate]}
              onValueChange={(vals) => setCloseRate(vals[0])}
              className="py-1"
            />
          </div>
        </div>
        
        <div className="border-t pt-3">
          <div className="text-xs font-medium mb-2">Projected Results:</div>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2 text-center">
            <div className="p-1 bg-muted/20 rounded text-xs">
              <span className="block text-muted-foreground">Contacts</span>
              <span className="font-medium">{projectedContacts}</span>
            </div>
            <div className="p-1 bg-muted/20 rounded text-xs">
              <span className="block text-muted-foreground">Scheduled</span>
              <span className="font-medium">{projectedScheduled}</span>
            </div>
            <div className="p-1 bg-muted/20 rounded text-xs">
              <span className="block text-muted-foreground">Sits</span>
              <span className="font-medium">{projectedSits}</span>
            </div>
            <div className="p-1 bg-muted/20 rounded text-xs">
              <span className="block text-muted-foreground">Sales</span>
              <span className="font-medium">{projectedSales}</span>
            </div>
            <div className="p-1 bg-muted/20 rounded text-xs">
              <span className="block text-muted-foreground">Potential AP</span>
              <span className="font-medium">${(projectedAP / 100).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
