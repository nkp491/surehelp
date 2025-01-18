import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

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
  const chartTypes: ("bar" | "line" | "pie")[] = ["bar", "line", "pie"];
  const timePeriods: ("24h" | "7d" | "30d")[] = ["24h", "7d", "30d"];
  const { toast } = useToast();
  const [date, setDate] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  const handleDateSelect = (selectedDate: { from: Date | undefined; to: Date | undefined } | undefined) => {
    if (!selectedDate) return;
    
    setDate(selectedDate);
    if (selectedDate.from && selectedDate.to) {
      onTimePeriodChange("custom");
      toast({
        title: "Date Range Selected",
        description: `Selected range: ${format(selectedDate.from, "PPP")} to ${format(selectedDate.to, "PPP")}`,
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-left">
        <h2 className="text-2xl font-bold text-[#2A6F97]">
          Metrics Visualization
        </h2>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 justify-end">
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
              {period === "24h" ? "24H" : period === "7d" ? "7D" : "30D"}
            </Button>
          ))}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={timePeriod === "custom" ? "default" : "outline"}
                className="capitalize"
              >
                {date.from && date.to ? (
                  <>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(date.from, "MMM d")} - {format(date.to, "MMM d")}
                  </>
                ) : (
                  <>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Custom
                  </>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date.from}
                selected={date}
                onSelect={handleDateSelect}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};

export default ChartControls;