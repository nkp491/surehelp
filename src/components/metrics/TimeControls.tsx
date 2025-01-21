import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useMetrics } from "@/contexts/MetricsContext";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useToast } from "../ui/use-toast";

const TimeControls = () => {
  const { timePeriod, dateRange, handleTimePeriodChange, setDateRange } = useMetrics();
  const { toast } = useToast();

  const handleDateSelection = (range: { from: Date | undefined; to: Date | undefined }) => {
    setDateRange(range);
    handleTimePeriodChange("custom");
    if (range.from && range.to) {
      toast({
        title: "Date Range Selected",
        description: `Selected range: ${format(range.from, "MMM d")} - ${format(range.to, "MMM d")}`,
      });
    }
  };

  return (
    <div className="flex justify-end">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={timePeriod === "custom" ? "default" : "outline"}
            className="flex items-center gap-2"
          >
            <CalendarIcon className="h-4 w-4" />
            {dateRange.from && dateRange.to ? (
              <>
                {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d")}
              </>
            ) : (
              "Select Date Range"
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange.from}
            selected={{
              from: dateRange.from,
              to: dateRange.to,
            }}
            onSelect={handleDateSelection}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default TimeControls;