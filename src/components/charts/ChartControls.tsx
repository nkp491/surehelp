import { Button } from "@/components/ui/button";
import { ChartType, TimePeriod } from "@/types/metrics";

interface ChartControlsProps {
  chartType: ChartType;
  timePeriod: TimePeriod;
  onChartTypeChange: (type: ChartType) => void;
  onTimePeriodChange: (period: TimePeriod) => void;
}

const ChartControls = ({
  chartType,
  timePeriod,
  onChartTypeChange,
  onTimePeriodChange,
}: ChartControlsProps) => {
  const chartTypes: ChartType[] = ["bar", "line", "pie"];
  const timePeriods: TimePeriod[] = ["24h", "7d", "30d", "custom"];

  return (
    <div className="space-y-4">
      <div className="text-left">
        <h2 className="text-2xl font-bold text-[#2A6F97]">
          Metrics Visualization
        </h2>
      </div>
      <div className="flex flex-col sm:flex-row justify-end gap-4">
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
        <div className="flex gap-2">
          {timePeriods.map((period) => (
            <Button
              key={period}
              variant={timePeriod === period ? "default" : "outline"}
              onClick={() => onTimePeriodChange(period)}
              className="capitalize"
            >
              {period === "24h" ? "24H" : period === "7d" ? "7D" : period === "30d" ? "30D" : "Custom"}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChartControls;