
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import DateRangePicker from "@/components/charts/DateRangePicker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TimePeriod } from "@/types/metrics";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface SearchFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedDate?: Date;
  onDateChange: (date: Date | null) => void;
  timePeriod: TimePeriod;
  onTimePeriodChange: (period: TimePeriod) => void;
}

const SearchFilters = ({
  searchTerm,
  onSearchChange,
  selectedDate,
  onDateChange,
  timePeriod,
  onTimePeriodChange,
}: SearchFiltersProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center space-x-4">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search metrics..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8 w-[200px]"
        />
        <Search className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
      </div>
      
      {/* Specific date picker for searching entries */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn("w-[240px] justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? format(selectedDate, "PPP") : "Search by date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              onDateChange(date);
              setOpen(false);
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      
      {/* For time period selection - separate from date search */}
      <DateRangePicker
        timePeriod={timePeriod}
        onTimePeriodChange={onTimePeriodChange}
        onDateRangeChange={() => {}}
      />
    </div>
  );
};

export default SearchFilters;
