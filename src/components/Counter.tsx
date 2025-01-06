import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";

interface CounterProps {
  count: number;
  onIncrement: () => void;
}

const Counter = ({ count, onIncrement }: CounterProps) => {
  return (
    <div className="flex items-center gap-2 bg-white p-3 rounded-md border">
      <Button
        onClick={onIncrement}
        variant="outline"
        size="lg"
        className="flex items-center gap-2 text-lg px-6 py-6"
      >
        <Plus className="h-6 w-6" />
        Add
      </Button>
      <span className="text-lg font-medium px-4">Count: {count}</span>
      <Button
        onClick={() => onIncrement()}
        variant="outline"
        size="lg"
        className="flex items-center gap-2 text-lg px-6 py-6"
      >
        <Minus className="h-6 w-6" />
        Subtract
      </Button>
    </div>
  );
};

export default Counter;