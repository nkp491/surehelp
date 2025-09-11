import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useMetrics } from "@/contexts/MetricsContext";
import { format } from "date-fns";
import { useToast } from "../ui/use-toast";
import { cn } from "@/lib/utils";
import { roleService } from "@/services/roleService";

const TimeControls = () => {
  const userRoles = roleService.getRoles();
  const isAgent =
    userRoles.length > 1 ? false : userRoles.includes("agent") ? true : false;
  const { timePeriod, dateRange, handleTimePeriodChange, setDateRange } =
    useMetrics();
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

  const tabStyle = "px-6 py-2 rounded-t-lg font-medium transition-colors";
  const activeTabStyle = "bg-[#3F7BA9] text-white";
  const inactiveTabStyle = "text-[#3F7BA9] hover:bg-[#3F7BA9]/10";
  return (
    <div className="flex gap-0.5 items-end justify-end w-full">
      <button
        onClick={() => handlePeriodChange("24h")}
        className={cn(
          tabStyle,
          timePeriod === "24h" ? activeTabStyle : inactiveTabStyle
        )}
      >
        Daily
      </button>
      <button
        onClick={() => handlePeriodChange("7d")}
        className={cn(
          tabStyle,
          timePeriod === "7d" ? activeTabStyle : inactiveTabStyle
        )}
      >
        Weekly
      </button>
      <button
        onClick={() => handlePeriodChange("30d")}
        className={cn(
          tabStyle,
          timePeriod === "30d" ? activeTabStyle : inactiveTabStyle
        )}
      >
        Monthly
      </button>
      {!isAgent && (
        <Popover>
          <PopoverTrigger asChild>
            <button
              className={cn(
                tabStyle,
                timePeriod === "custom" ? activeTabStyle : inactiveTabStyle
              )}
            >
              {dateRange.from && dateRange.to ? (
                <>
                  {format(dateRange.from, "MMM d")} -{" "}
                  {format(dateRange.to, "MMM d")}
                </>
              ) : (
                "Custom"
              )}
            </button>
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
                if (range?.from && range?.to) {
                  handleTimePeriodChange("custom");
                }
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

export default TimeControls;
