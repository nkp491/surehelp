import * as React from "react";
import { format, parse, isValid } from "date-fns";
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
  placeholder?: string;
}

export function DatePicker({
  selected,
  onSelect,
  maxDate,
  placeholder = "MM/DD/YYYY"
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [currentMonth, setCurrentMonth] = React.useState<Date>(selected || new Date());

  React.useEffect(() => {
    if (selected) {
      setInputValue(format(selected, "MM/dd/yyyy"));
      setCurrentMonth(selected);
    } else {
      setInputValue("");
    }
  }, [selected]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Allow backspace/delete to clear the input
    if (!value) {
      onSelect(null);
      return;
    }

    // Only attempt to parse if we have a complete date format
    if (value.length === 10) {
      try {
        const date = parse(value, "MM/dd/yyyy", new Date());
        
        if (isValid(date)) {
          // Check if date is within allowed range
          if (maxDate && date > maxDate) {
            return;
          }
          onSelect(date);
        }
      } catch (error) {
        // Invalid date format, just update the input
        return;
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow backspace/delete
    if (e.key === "Backspace" || e.key === "Delete") {
      return;
    }

    // Block non-numeric keys except for forward slash
    if (!/[\d/]/.test(e.key) && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
    }

    // Auto-add slashes
    if (e.key !== "Backspace" && e.key !== "Delete") {
      const input = e.currentTarget;
      if (input.value.length === 2 || input.value.length === 5) {
        input.value = input.value + "/";
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
        placeholder={placeholder}
        className="pr-10"
        maxLength={10}
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
            month={currentMonth}
            onMonthChange={setCurrentMonth}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
