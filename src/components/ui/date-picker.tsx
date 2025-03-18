
import * as React from "react";
import { format, parse } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [calendarKey, setCalendarKey] = React.useState<number>(0); // Used to force re-render the calendar

  // Generate array of years from 120 years ago to current year
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 121 }, (_, i) => currentYear - 120 + i);

  // Generate array of month names
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

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
    if (value.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      try {
        const date = parse(value, "MM/dd/yyyy", new Date());
        
        // Check if it's a valid date and within the allowed range
        if (
          !isNaN(date.getTime()) && 
          (!maxDate || date <= maxDate) &&
          (!minDate || date >= minDate)
        ) {
          onSelect(date);
          setYear(date.getFullYear());
          setMonth(date);
        }
      } catch (error) {
        // Invalid date format, do nothing
      }
    }
  };

  const handleYearChange = (value: string) => {
    const newYear = parseInt(value);
    setYear(newYear);
    
    // Update the displayed month with the new year
    const newDate = new Date(month);
    newDate.setFullYear(newYear);
    setMonth(newDate);
    
    // Force calendar to re-render with new year
    setCalendarKey(prev => prev + 1);
  };

  const handleMonthChange = (value: string) => {
    const monthIndex = months.indexOf(value);
    if (monthIndex !== -1) {
      const newDate = new Date(month);
      newDate.setMonth(monthIndex);
      setMonth(newDate);
      
      // Force calendar to re-render with new month
      setCalendarKey(prev => prev + 1);
    }
  };

  const handleMonthNavigation = (direction: 'prev' | 'next') => {
    const newDate = new Date(month);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setMonth(newDate);
    
    // Update year if month navigation crosses year boundary
    setYear(newDate.getFullYear());
    
    // Force calendar to re-render
    setCalendarKey(prev => prev + 1);
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
              <div className="flex items-center justify-between mb-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleMonthNavigation('prev')}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex gap-2">
                  <Select
                    value={months[month.getMonth()]}
                    onValueChange={handleMonthChange}
                  >
                    <SelectTrigger className="w-[120px] h-8">
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month} value={month}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select
                    value={year.toString()}
                    onValueChange={handleYearChange}
                  >
                    <SelectTrigger className="w-[90px] h-8">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleMonthNavigation('next')}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Calendar
              key={calendarKey}
              mode="single"
              selected={selected || undefined}
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
              onMonthChange={setMonth}
              className="pointer-events-auto"
              showOutsideDays={false}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
