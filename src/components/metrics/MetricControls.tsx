import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";

interface MetricControlsProps {
  onIncrement: () => void;
  onDecrement: () => void;
}

const MetricControls = ({ onIncrement, onDecrement }: MetricControlsProps) => {
  return (
    <div className="flex items-center gap-2 w-full justify-center">
      <Button
        onClick={onDecrement}
        variant="outline"
        size="icon"
        className="h-8 w-8"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Button
        onClick={onIncrement}
        variant="outline"
        size="icon"
        className="h-8 w-8"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default MetricControls;