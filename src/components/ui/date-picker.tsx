
import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface DatePickerProps {
  selected: Date | null;
  onSelect: (date: Date | null) => void;
  maxDate?: Date;
}

export function DatePicker({
  selected,
  onSelect,
  maxDate,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  React.useEffect(() => {
    if (selected) {
      setInputValue(format(selected, "MM/dd/yyyy"));
    }
  }, [selected]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Try to parse the date in MM/DD/YYYY format
    const parts = value.split('/');
    if (parts.length === 3) {
      const month = parseInt(parts[0]) - 1; // months are 0-based
      const day = parseInt(parts[1]);
      const year = parseInt(parts[2]);
      
      const date = new Date(year, month, day);
      
      // Check if it's a valid date and within the allowed range
      if (
        !isNaN(date.getTime()) && 
        (!maxDate || date <= maxDate)
      ) {
        onSelect(date);
      }
    }
  };

  return (
    <div className="relative">
      <Input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder="MM/DD/YYYY"
        className="pr-10"
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={"ghost"}
            className={cn(
              "absolute right-0 top-0 h-full px-2 hover:bg-transparent"
            )}
          >
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={(date) => {
              onSelect(date);
              setOpen(false);
            }}
            disabled={(date) => maxDate ? date > maxDate : false}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
