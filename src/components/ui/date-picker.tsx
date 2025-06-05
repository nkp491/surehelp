import { format, parse, isValid } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef, type ChangeEvent, type KeyboardEvent } from "react";

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
  placeholder = "MM/DD/YYYY",
}: Readonly<DatePickerProps>) {
  const [inputValue, setInputValue] = useState("");
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selected) {
      setInputValue(format(selected, "MM/dd/yyyy"));
    } else {
      setInputValue("");
    }
  }, [selected]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    if (!value) {
      onSelect(null);
      return;
    }
    if (value.length === 10) {
      try {
        const date = parse(value, "MM/dd/yyyy", new Date());
        if (isValid(date)) {
          if (maxDate && date > maxDate) {
            return;
          }
          onSelect(date);
        }
      } catch (error) {
        return;
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" || e.key === "Delete") {
      return;
    }
    if (!/[\d/]/.test(e.key) && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
    }
    if (e.key !== "Backspace" && e.key !== "Delete") {
      const input = e.currentTarget;
      if (input.value.length === 2 || input.value.length === 5) {
        input.value = input.value + "/";
      }
    }
  };

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value) : null;
    if (date && (!maxDate || date <= maxDate)) {
      onSelect(date);
    }
  };

  const openDatePicker = () => {
    dateInputRef.current?.showPicker();
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
        onClick={openDatePicker}
      />
      <button
        type="button"
        onClick={openDatePicker}
        className="absolute right-0 top-0 flex h-full cursor-pointer items-center pr-3 hover:bg-transparent"
      >
        <CalendarIcon className="h-4 w-4 text-muted-foreground cursor-pointer" />
      </button>
      <input
        ref={dateInputRef}
        type="date"
        className="absolute left-0 top-0 h-full w-full opacity-0"
        value={selected ? format(selected, "yyyy-MM-dd") : ""}
        onChange={handleDateChange}
        max={maxDate ? format(maxDate, "yyyy-MM-dd") : undefined}
      />
    </div>
  );
}
