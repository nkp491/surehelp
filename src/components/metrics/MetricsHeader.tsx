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
    <div className="flex justify-end items-center mb-1 px-2">
      <Button 
        onClick={handleSave}
        size="sm"
        className="h-6 px-2 bg-primary hover:bg-primary/90 text-white flex items-center gap-1 transition-colors duration-200"
      >
        <Check className="h-3 w-3" />
        Log
      </Button>
    </div>
  );
};

export default MetricsHeader;