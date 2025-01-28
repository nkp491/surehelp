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
        <PopoverContent 
          className="z-[100] bg-white p-0" 
          align="start"
          sideOffset={4}
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <div className="p-0.5">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => {
                setDate(date);
              }}
              initialFocus
              disabled={(date) => date > new Date()}
              className="rounded-md border shadow-sm"
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateInput;