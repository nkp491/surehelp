
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
}

export function DatePicker({
  selected,
  onSelect,
  maxDate,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [year, setYear] = React.useState<number>(selected?.getFullYear() || new Date().getFullYear());
  const [month, setMonth] = React.useState<Date>(
    selected || new Date(year, new Date().getMonth())
  );

  React.useEffect(() => {
    if (selected) {
      setInputValue(format(selected, "MM/dd/yyyy"));
      setYear(selected.getFullYear());
      setMonth(selected);
    }
  }, [selected]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Allow the user to clear the input
    if (!newValue) {
      setInputValue("");
      onSelect(null);
      return;
    }
    
    // Only allow digits and slashes in the input
    const sanitizedValue = newValue.replace(/[^\d/]/g, '');
    setInputValue(sanitizedValue);
    
    // Try to parse the date if it looks like a complete MM/DD/YYYY date
    if (sanitizedValue.length >= 8) {
      const parts = sanitizedValue.split('/');
      
      if (parts.length === 3 || 
         (parts.length === 2 && parts[1].length >= 4) ||
         (parts.length === 1 && parts[0].length >= 8)) {
        
        let month, day, year;
        
        // Handle different formats
        if (parts.length === 3) {
          month = parseInt(parts[0]);
          day = parseInt(parts[1]);
          year = parseInt(parts[2]);
        } else if (parts.length === 2) {
          month = parseInt(parts[0]);
          day = parseInt(parts[1].substring(0, 2));
          year = parseInt(parts[1].substring(2));
        } else {
          month = parseInt(sanitizedValue.substring(0, 2));
          day = parseInt(sanitizedValue.substring(2, 4));
          year = parseInt(sanitizedValue.substring(4));
        }
        
        // Basic validation
        if (month >= 1 && month <= 12 && 
            day >= 1 && day <= 31 && 
            year >= 1900 && year <= 2100) {
          
          const date = new Date(year, month - 1, day);
          
          // Further validation
          if (date.getMonth() === month - 1 && 
              date.getDate() === day && 
              date.getFullYear() === year &&
              (!maxDate || date <= maxDate)) {
            
            onSelect(date);
            
            // Format the date properly
            setInputValue(format(date, "MM/dd/yyyy"));
          }
        }
      }
    }
  };

  // Generate array of years from 120 years ago to current year
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 121 }, (_, i) => currentYear - 120 + i);

  const handleYearChange = (value: string) => {
    const newYear = parseInt(value);
    setYear(newYear);
    
    // Update the month view to show the same month in the new year
    const newMonth = new Date(month);
    newMonth.setFullYear(newYear);
    setMonth(newMonth);
    
    if (selected) {
      const newDate = new Date(selected);
      newDate.setFullYear(newYear);
      onSelect(newDate);
    }
  };

  const handleMonthChange = (newMonth: Date) => {
    setMonth(newMonth);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow navigation keys and expected date input characters
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', '/'];
    const isDigit = /^\d$/.test(e.key);
    
    if (!isDigit && !allowedKeys.includes(e.key)) {
      e.preventDefault();
    }
    
    // Auto-add slashes for better UX
    if (isDigit) {
      const curValue = e.currentTarget.value;
      if ((curValue.length === 2 || curValue.length === 5) && !curValue.endsWith('/')) {
        setInputValue(curValue + '/' + e.key);
        e.preventDefault();
      }
    }
  };

  return (
    <div className="relative">
      <Input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
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
        <PopoverContent className="w-auto p-0 z-50 bg-white" align="start">
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
            disabled={(date) => maxDate ? date > maxDate : false}
            initialFocus
            month={month}
            onMonthChange={handleMonthChange}
            className="p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
