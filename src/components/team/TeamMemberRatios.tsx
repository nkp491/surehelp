
import { MetricCount } from "@/types/metrics";
import { calculateRatios } from "@/utils/metricsUtils";
import { formatCurrency } from "@/utils/metricsUtils";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TeamMemberRatiosProps {
  metrics: MetricCount;
}

export function TeamMemberRatios({ metrics }: TeamMemberRatiosProps) {
  // Calculate percentage-based ratios
  const leadToContactRate = metrics.leads > 0 
    ? Math.round((metrics.contacts / metrics.leads) * 100)
    : 0;
  
  const leadToScheduledRate = metrics.leads > 0 
    ? Math.round((metrics.scheduled / metrics.leads) * 100)
    : 0;
  
  const leadToSitsRate = metrics.leads > 0 
    ? Math.round((metrics.sits / metrics.leads) * 100) 
    : 0;
  
  const leadToSalesRate = metrics.leads > 0 
    ? Math.round((metrics.sales / metrics.leads) * 100)
    : 0;
  
  const callsToContactRate = metrics.calls > 0 
    ? Math.round((metrics.contacts / metrics.calls) * 100)
    : 0;
  
  const callsToScheduledRate = metrics.calls > 0 
    ? Math.round((metrics.scheduled / metrics.calls) * 100)
    : 0;
  
  const callsToSitsRate = metrics.calls > 0 
    ? Math.round((metrics.sits / metrics.calls) * 100)
    : 0;
  
  const callsToSalesRate = metrics.calls > 0 
    ? Math.round((metrics.sales / metrics.calls) * 100)
    : 0;
  
  const contactToScheduledRate = metrics.contacts > 0 
    ? Math.round((metrics.scheduled / metrics.contacts) * 100)
    : 0;
  
  const contactToSitsRate = metrics.contacts > 0 
    ? Math.round((metrics.sits / metrics.contacts) * 100)
    : 0;
  
  const contactToSalesRate = metrics.contacts > 0 
    ? Math.round((metrics.sales / metrics.contacts) * 100)
    : 0;
  
  const scheduledToSitsRate = metrics.scheduled > 0 
    ? Math.round((metrics.sits / metrics.scheduled) * 100)
    : 0;
  
  const sitsToSalesRate = metrics.sits > 0 
    ? Math.round((metrics.sales / metrics.sits) * 100)
    : 0;
  
  // Calculate dollar-based metrics
  const apPerLead = metrics.leads > 0
    ? (metrics.ap / 100 / metrics.leads)
    : 0;
  
  const apPerCall = metrics.calls > 0
    ? (metrics.ap / 100 / metrics.calls)
    : 0;
  
  const apPerContact = metrics.contacts > 0
    ? (metrics.ap / 100 / metrics.contacts)
    : 0;
  
  const apPerSit = metrics.sits > 0
    ? (metrics.ap / 100 / metrics.sits)
    : 0;
  
  const apPerSale = metrics.sales > 0
    ? (metrics.ap / 100 / metrics.sales)
    : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <RatioCard
        value={`${leadToContactRate}%`}
        label="Lead to Contact"
        tooltip="Percentage of leads that become contacts"
      />
      
      <RatioCard
        value={`${leadToScheduledRate}%`}
        label="Lead to Scheduled"
        tooltip="Percentage of leads that get scheduled"
      />
      
      <RatioCard
        value={`${leadToSitsRate}%`}
        label="Lead to Sits"
        tooltip="Percentage of leads that result in sits"
      />
      
      <RatioCard
        value={`${leadToSalesRate}%`}
        label="Lead to Sales"
        tooltip="Percentage of leads that convert to sales"
      />
      
      <RatioCard
        value={`${callsToContactRate}%`}
        label="Calls to Contact"
        tooltip="Percentage of calls that result in contacts"
      />
      
      <RatioCard
        value={`${callsToScheduledRate}%`}
        label="Calls to Scheduled"
        tooltip="Percentage of calls that result in scheduled appointments"
      />
      
      <RatioCard
        value={`${callsToSitsRate}%`}
        label="Calls to Sits"
        tooltip="Percentage of calls that result in sits"
      />
      
      <RatioCard
        value={`${callsToSalesRate}%`}
        label="Calls to Sales"
        tooltip="Percentage of calls that convert to sales"
      />
      
      <RatioCard
        value={`$${apPerLead.toFixed(0)}`}
        label="AP per Lead"
        tooltip="Average premium per lead"
      />
      
      <RatioCard
        value={`$${apPerCall.toFixed(0)}`}
        label="AP per Call"
        tooltip="Average premium per call made"
      />
      
      <RatioCard
        value={`${contactToScheduledRate}%`}
        label="Contact to Scheduled"
        tooltip="Percentage of contacts that get scheduled"
      />
      
      <RatioCard
        value={`${contactToSitsRate}%`}
        label="Contact to Sits"
        tooltip="Percentage of contacts that result in sits"
      />
      
      <RatioCard
        value={`${contactToSalesRate}%`}
        label="Contact to Sales"
        tooltip="Percentage of contacts that convert to sales"
      />
      
      <RatioCard
        value={`$${apPerContact.toFixed(0)}`}
        label="AP per Contact"
        tooltip="Average premium per contact"
      />
      
      <RatioCard
        value={`${scheduledToSitsRate}%`}
        label="Scheduled to Sits"
        tooltip="Percentage of scheduled appointments that result in sits"
      />
      
      <RatioCard
        value={`${sitsToSalesRate}%`}
        label="Sits to Sales"
        tooltip="Percentage of sits that convert to sales (close rate)"
      />
      
      <RatioCard
        value={`$${apPerSit.toFixed(0)}`}
        label="AP per Sit"
        tooltip="Average premium per sit"
      />
      
      <RatioCard
        value={`$${apPerSale.toFixed(0)}`}
        label="AP per Sale"
        tooltip="Average premium per sale"
      />
    </div>
  );
}

function RatioCard({ 
  value, 
  label, 
  tooltip 
}: { 
  value: string; 
  label: string; 
  tooltip?: string;
}) {
  return (
    <div className="bg-gray-50 rounded-md p-3 text-center flex flex-col justify-center">
      <div className="font-semibold text-lg">{value}</div>
      <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
        {label}
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs max-w-xs">
                <p>{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
}
