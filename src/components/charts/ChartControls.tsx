import { Button } from "@/components/ui/button";
import { ChartType } from "@/types/metrics";

interface ChartControlsProps {
  chartType: ChartType;
  onChartTypeChange: (type: ChartType) => void;
}

const ChartControls = ({
  chartType,
  onChartTypeChange,
}: ChartControlsProps) => {
  const chartTypes: ChartType[] = ["bar", "line", "pie"];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-[#2A6F97]">
        Metrics Visualization
      </h2>
      <div className="flex gap-2">
        {chartTypes.map((type) => (
          <Button
            key={type}
            variant={chartType === type ? "default" : "outline"}
            onClick={() => onChartTypeChange(type)}
            className="capitalize"
          >
            {type}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ChartControls;