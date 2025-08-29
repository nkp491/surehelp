import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useMetrics } from "@/contexts/MetricsContext";
import { useToast } from "@/hooks/use-toast";

interface MetricsHeaderProps {
  onSave: () => void;
}

const MetricsHeader = ({ onSave }: MetricsHeaderProps) => {
  const { metrics, setMetrics } = useMetrics();
  const { toast } = useToast();

  // Check if any metrics have values greater than 0
  const hasValidMetrics = Object.values(metrics).some((value) => value > 0);

  const handleSave = async () => {
    if (!hasValidMetrics) {
      toast({
        title: "No Metrics to Log",
        description: "Please add at least 1 metric before logging",
        variant: "destructive",
      });
      return;
    }

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
        disabled={!hasValidMetrics}
        size="sm"
        className={`h-6 px-2 flex items-center gap-1 transition-colors duration-200 ${
          hasValidMetrics
            ? "bg-primary hover:bg-primary/90 text-white"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        <Check className="h-3 w-3" />
        Log
      </Button>
    </div>
  );
};

export default MetricsHeader;
