import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useMetrics } from "@/contexts/MetricsContext";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Clock, CalendarIcon, CalendarDays } from "lucide-react";
import { useToast } from "../ui/use-toast";

const TimeControls = () => {
  const { timePeriod, dateRange, handleTimePeriodChange, setDateRange } = useMetrics();
  const { toast } = useToast();

  const handlePeriodChange = (period: "24h" | "7d" | "30d" | "custom") => {
    handleTimePeriodChange(period);
    toast({
      title: "Time Period Changed",
      description: `Switched to ${
        period === "24h" 
          ? "daily" 
          : period === "7d" 
          ? "weekly" 
          : period === "30d" 
          ? "monthly" 
          : "custom"
      } metrics view`,
    });
  };

  return (
    <div className="flex gap-4">
      <Button
        variant={timePeriod === "24h" ? "default" : "outline"}
        onClick={() => handlePeriodChange("24h")}
        className="flex items-center gap-2"
      >
        <Clock className="h-4 w-4" />
        Daily
      </Button>
      <Button
        variant={timePeriod === "7d" ? "default" : "outline"}
        onClick={() => handlePeriodChange("7d")}
        className="flex items-center gap-2"
      >
        <CalendarIcon className="h-4 w-4" />
        Weekly
      </Button>
      <Button
        variant={timePeriod === "30d" ? "default" : "outline"}
        onClick={() => handlePeriodChange("30d")}
        className="flex items-center gap-2"
      >
        <CalendarDays className="h-4 w-4" />
        Monthly
      </Button>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={timePeriod === "custom" ? "default" : "outline"}
            className={cn(
              "justify-start text-left font-normal",
              !dateRange.from && "text-muted-foreground"
            )}
            onClick={() => handlePeriodChange("custom")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} -{" "}
                  {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>Custom Range</span>
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
            onSelect={(range) => {
              setDateRange({
                from: range?.from,
                to: range?.to,
              });
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default TimeControls;