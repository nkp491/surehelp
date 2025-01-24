import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useMetrics } from "@/contexts/MetricsContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface MetricsHeaderProps {
  onSave: () => void;
}

const MetricsHeader = ({ onSave }: MetricsHeaderProps) => {
  const { setMetrics } = useMetrics();
  const { toast } = useToast();

  const handleSave = async () => {
    const today = new Date();
    console.log('[MetricsHeader] Saving metrics for date:', {
      date: format(today, 'yyyy-MM-dd'),
      timestamp: today.toISOString(),
    });
    
    await onSave();
    
    setMetrics({
      leads: 0,
      calls: 0,
      contacts: 0,
      scheduled: 0,
      sits: 0,
      sales: 0,
      ap: 0,
    });

    toast({
      title: "Metrics Logged",
      description: "Your metrics have been saved and reset for the next day",
    });
  };

  return (
    <div className="flex justify-between items-center px-1 py-1">
      <h2 className="text-base font-medium text-[#2A6F97] flex items-center">
        KPI Tracker
      </h2>
      <Button 
        onClick={handleSave}
        size="sm"
        className="bg-[#6CAEC2] hover:bg-[#4A8A9E] text-white flex items-center gap-1.5 transition-colors duration-200 rounded-full px-3 h-7"
        title="Save today's metrics"
      >
        <Check className="h-3.5 w-3.5" />
        Log
      </Button>
    </div>
  );
};

export default MetricsHeader;