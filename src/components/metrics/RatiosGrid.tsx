
import { MetricCount } from "@/types/metrics";

interface RatiosGridProps {
  teamId?: string;
  metrics: MetricCount;
}

export default function RatiosGrid({ teamId, metrics }: RatiosGridProps) {
  // Calculate ratios based on the provided metrics
  const contactsToLeads = metrics.leads > 0 
    ? ((metrics.contacts / metrics.leads) * 100).toFixed(1) 
    : '0';
  
  const scheduledToContacts = metrics.contacts > 0 
    ? ((metrics.scheduled / metrics.contacts) * 100).toFixed(1) 
    : '0';
  
  const sitsToScheduled = metrics.scheduled > 0 
    ? ((metrics.sits / metrics.scheduled) * 100).toFixed(1) 
    : '0';
  
  const salesToSits = metrics.sits > 0 
    ? ((metrics.sales / metrics.sits) * 100).toFixed(1) 
    : '0';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-muted/30 p-4 rounded-md">
        <p className="text-xs text-muted-foreground mb-1">Contacts / Leads</p>
        <p className="text-2xl font-semibold">{contactsToLeads}%</p>
      </div>
      
      <div className="bg-muted/30 p-4 rounded-md">
        <p className="text-xs text-muted-foreground mb-1">Scheduled / Contacts</p>
        <p className="text-2xl font-semibold">{scheduledToContacts}%</p>
      </div>
      
      <div className="bg-muted/30 p-4 rounded-md">
        <p className="text-xs text-muted-foreground mb-1">Sits / Scheduled</p>
        <p className="text-2xl font-semibold">{sitsToScheduled}%</p>
      </div>
      
      <div className="bg-muted/30 p-4 rounded-md">
        <p className="text-xs text-muted-foreground mb-1">Sales / Sits</p>
        <p className="text-2xl font-semibold">{salesToSits}%</p>
      </div>
    </div>
  );
}
