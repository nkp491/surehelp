import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface MetricsHeaderProps {
  onSave: () => void;
}

const MetricsHeader = ({ onSave }: MetricsHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-lg font-semibold text-[#2A6F97]">KPI Tracker</h2>
      <Button 
        onClick={onSave}
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