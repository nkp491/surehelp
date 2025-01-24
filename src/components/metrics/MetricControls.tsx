import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";

interface MetricControlsProps {
  onIncrement: () => void;
  onDecrement: () => void;
}

const MetricControls = ({ onIncrement, onDecrement }: MetricControlsProps) => {
  return (
    <div className="flex items-center gap-1.5 w-full justify-center">
      <Button
        onClick={onDecrement}
        variant="outline"
        size="icon"
        className="h-7 w-7"
      >
        <Minus className="h-3.5 w-3.5" />
      </Button>
      <Button
        onClick={onIncrement}
        variant="outline"
        size="icon"
        className="h-7 w-7"
      >
        <Plus className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
};

export default MetricControls;