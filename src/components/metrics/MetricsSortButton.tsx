import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

interface MetricsSortButtonProps {
  onSort: () => void;
}

const MetricsSortButton = ({ onSort }: MetricsSortButtonProps) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0"
      onClick={onSort}
    >
      <ArrowUpDown className="h-4 w-4 text-[#2A6F97]" />
    </Button>
  );
};

export default MetricsSortButton;