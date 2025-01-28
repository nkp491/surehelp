import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";

interface MetricControlsProps {
  onIncrement: () => void;
  onDecrement: () => void;
}

const MetricControls = ({ onIncrement, onDecrement }: MetricControlsProps) => {
  return (
    <div className="flex items-center gap-0.5 w-full justify-center">
      <Button
        onClick={onDecrement}
        variant="outline"
        size="icon"
        className="h-4 w-4 bg-transparent hover:bg-gray-50/10"
      >
        <Minus className="h-2 w-2" />
      </Button>
      <Button
        onClick={onIncrement}
        variant="outline"
        size="icon"
        className="h-4 w-4 bg-transparent hover:bg-gray-50/10"
      >
        <Plus className="h-2 w-2" />
      </Button>
    </div>
  );
};

export default MetricControls;