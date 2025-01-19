import ChartTypeControls from "./ChartTypeControls";
import TimePeriodControls from "./TimePeriodControls";
import DateRangePicker from "./DateRangePicker";

interface ChartControlsProps {
  chartType: "bar" | "line" | "pie";
  timePeriod: "24h" | "7d" | "30d" | "custom";
  onChartTypeChange: (type: "bar" | "line" | "pie") => void;
  onTimePeriodChange: (period: "24h" | "7d" | "30d" | "custom") => void;
}

const ChartControls = ({
  chartType,
  timePeriod,
  onChartTypeChange,
  onTimePeriodChange,
}: ChartControlsProps) => {
  return (
    <div className="space-y-4">
      <div className="text-left">
        <h2 className="text-2xl font-bold text-[#2A6F97]">
          Metrics Visualization
        </h2>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 justify-end">
        <ChartTypeControls 
          chartType={chartType} 
          onChartTypeChange={onChartTypeChange} 
        />
        <div className="flex gap-2">
          <TimePeriodControls 
            timePeriod={timePeriod} 
            onTimePeriodChange={onTimePeriodChange} 
          />
          <DateRangePicker 
            timePeriod={timePeriod} 
            onTimePeriodChange={onTimePeriodChange} 
          />
        </div>
      </div>
    </div>
  );
};

export default ChartControls;