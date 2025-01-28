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
        variant="ghost"
        size="icon"
        className="h-4 w-4 p-0 hover:bg-transparent hover:text-primary/80"
      >
        <Minus className="h-3 w-3" />
      </Button>
      <Button
        onClick={onIncrement}
        variant="ghost"
        size="icon"
        className="h-4 w-4 p-0 hover:bg-transparent hover:text-primary/80"
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
};

export default MetricControls;