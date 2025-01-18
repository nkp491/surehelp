import { Button } from "@/components/ui/button";

interface ChartTypeControlsProps {
  chartType: "bar" | "line" | "pie";
  onChartTypeChange: (type: "bar" | "line" | "pie") => void;
}

const ChartTypeControls = ({ chartType, onChartTypeChange }: ChartTypeControlsProps) => {
  const chartTypes: ("bar" | "line" | "pie")[] = ["bar", "line", "pie"];

  return (
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
  );
};

export default ChartTypeControls;