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
        className="h-5 w-5 bg-white hover:bg-gray-50"
      >
        <Minus className="h-2.5 w-2.5" />
      </Button>
      <Button
        onClick={onIncrement}
        variant="outline"
        size="icon"
        className="h-5 w-5 bg-white hover:bg-gray-50"
      >
        <Plus className="h-2.5 w-2.5" />
      </Button>
    </div>
  );
};

export default MetricControls;