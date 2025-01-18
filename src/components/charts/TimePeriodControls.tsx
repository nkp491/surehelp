import { Button } from "@/components/ui/button";

interface TimePeriodControlsProps {
  timePeriod: "24h" | "7d" | "30d" | "custom";
  onTimePeriodChange: (period: "24h" | "7d" | "30d" | "custom") => void;
}

const TimePeriodControls = ({ timePeriod, onTimePeriodChange }: TimePeriodControlsProps) => {
  const timePeriods: ("24h" | "7d" | "30d")[] = ["24h", "7d", "30d"];

  return (
    <div className="flex gap-2">
      {timePeriods.map((period) => (
        <Button
          key={period}
          variant={timePeriod === period ? "default" : "outline"}
          onClick={() => onTimePeriodChange(period)}
          className="capitalize"
        >
          {period === "24h" ? "24H" : period === "7d" ? "7D" : "30D"}
        </Button>
      ))}
    </div>
  );
};

export default TimePeriodControls;