import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface DateInputProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}

const DateInput = ({ date, setDate }: DateInputProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Purchase Date</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`w-full justify-start text-left font-normal ${!date && "text-muted-foreground"}`}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : "Select date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateInput;