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
      <h2 className="text-base font-medium text-primary flex items-center">
        KPI Tracker
      </h2>
      <Button 
        onClick={handleSave}
        size="sm"
        className="bg-primary hover:bg-primary/90 text-white flex items-center gap-1.5 transition-colors duration-200"
      >
        <Check className="h-3.5 w-3.5" />
        Log
      </Button>
    </div>
  );
};

export default MetricsHeader;