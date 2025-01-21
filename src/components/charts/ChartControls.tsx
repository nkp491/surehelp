import DateRangePicker from "./DateRangePicker";

interface ChartControlsProps {
  timePeriod: "24h" | "7d" | "30d" | "custom";
  onTimePeriodChange: (period: "24h" | "7d" | "30d" | "custom") => void;
}

const ChartControls = ({
  timePeriod,
  onTimePeriodChange,
}: ChartControlsProps) => {
  return (
    <div className="space-y-4">
      <div className="text-left">
        <h2 className="text-2xl font-bold text-[#2A6F97]">
          KPI Visualization
        </h2>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 justify-end">
        <DateRangePicker 
          timePeriod={timePeriod} 
          onTimePeriodChange={onTimePeriodChange} 
        />
      </div>
    </div>
  );
};

export default ChartControls;