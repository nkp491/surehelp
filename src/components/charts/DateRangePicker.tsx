import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface DateRangePickerProps {
  timePeriod: "24h" | "7d" | "30d" | "custom";
  onTimePeriodChange: (period: "24h" | "7d" | "30d" | "custom") => void;
}

const DateRangePicker = ({ timePeriod, onTimePeriodChange }: DateRangePickerProps) => {
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
  );
};

export default DateRangePicker;