import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface DateRangePickerProps {
  timePeriod: "24h" | "7d" | "30d" | "custom";
  onTimePeriodChange: (period: "24h" | "7d" | "30d" | "custom") => void;
  onDateRangeChange?: (dates: { from: Date | undefined; to: Date | undefined }) => void;
}

const DateRangePicker = ({ 
  timePeriod, 
  onTimePeriodChange,
  onDateRangeChange 
}: DateRangePickerProps) => {
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
      onDateRangeChange?.(selectedDate);
      toast({
        title: "Date Range Selected",
        description: `Selected range: ${format(selectedDate.from, "PPP")} to ${format(selectedDate.to, "PPP")}`,
      });
    }
  };

  const handleClearDateRange = () => {
    setDate({ from: undefined, to: undefined });
    onTimePeriodChange("24h");
    onDateRangeChange?.({ from: undefined, to: undefined });
    toast({
      title: "Date Range Cleared",
      description: "Returned to default time period",
    });
  };

  return (
    <div className="flex gap-2">
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
      {date.from && date.to && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClearDateRange}
          className="h-10 w-10"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default DateRangePicker;