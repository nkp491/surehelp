
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DatePickerProps {
  selected: Date | null;
  onSelect: (date: Date | null) => void;
  maxDate?: Date;
  minDate?: Date;
  label?: string;
}

export function DatePicker({
  selected,
  onSelect,
  maxDate,
  minDate,
  label,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [year, setYear] = React.useState<number>(selected?.getFullYear() || new Date().getFullYear());
  const [month, setMonth] = React.useState<Date>(selected || new Date());

  React.useEffect(() => {
    if (selected) {
      setInputValue(format(selected, "MM/dd/yyyy"));
      setYear(selected.getFullYear());
      setMonth(selected);
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
        (!maxDate || date <= maxDate) &&
        (!minDate || date >= minDate)
      ) {
        onSelect(date);
      }
    }
  };

  // Generate array of years from 120 years ago to current year
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 121 }, (_, i) => currentYear - 120 + i);

  const handleYearChange = (value: string) => {
    const newYear = parseInt(value);
    setYear(newYear);
    
    if (selected) {
      const newDate = new Date(selected);
      newDate.setFullYear(newYear);
      onSelect(newDate);
      setMonth(newDate);
    } else {
      // If no date is selected, create a new date with the selected year and current month
      const newDate = new Date();
      newDate.setFullYear(newYear);
      setMonth(newDate);
    }
  };

  const handleMonthChange = (newMonth: Date) => {
    setMonth(newMonth);
  };

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}</label>}
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
            <div className="p-3 border-b">
              <Select
                value={year.toString()}
                onValueChange={handleYearChange}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Calendar
              mode="single"
              selected={selected}
              onSelect={(date) => {
                onSelect(date);
                setOpen(false);
              }}
              disabled={(date) => 
                (maxDate ? date > maxDate : false) || 
                (minDate ? date < minDate : false)
              }
              initialFocus
              month={month}
              onMonthChange={handleMonthChange}
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
