import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useMetrics } from "@/contexts/MetricsContext";
import { useToast } from "@/hooks/use-toast";

interface MetricsHeaderProps {
  onSave: () => void;
}

const MetricsHeader = ({ onSave }: MetricsHeaderProps) => {
  const { setMetrics } = useMetrics();
  const { toast } = useToast();

  const handleSave = async () => {
    await onSave();
    
    // Reset all metrics to 0 after saving
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
    <div className="flex justify-between items-center">
      <h2 className="text-lg font-semibold text-[#2A6F97]">KPI Tracker</h2>
      <Button 
        onClick={handleSave}
        className="bg-[#6CAEC2] hover:bg-[#4A8A9E] text-white flex items-center gap-2 transition-colors duration-200"
        title="Save today's metrics"
      >
        <Check className="h-4 w-4" />
        Log
      </Button>
    </div>
  );
};

export default MetricsHeader;