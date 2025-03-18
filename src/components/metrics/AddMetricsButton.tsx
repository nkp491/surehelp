
import React from 'react';
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { startOfDay } from "date-fns";
import { CalendarIcon } from "lucide-react";

interface AddMetricsButtonProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date | null) => void;
  onAdd: (date: Date) => void;
}

const AddMetricsButton = ({
  selectedDate,
  onDateSelect,
  onAdd,
}: AddMetricsButtonProps) => {
  const handleDateSelect = (date: Date | null) => {
    if (date) {
      onDateSelect(startOfDay(date));
    } else {
      onDateSelect(null);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <DatePicker
        selected={selectedDate}
        onSelect={handleDateSelect}
        maxDate={new Date()}
        label="Select date"
        placeholder="MM/DD/YYYY"
      />
      <Button
        onClick={() => selectedDate && onAdd(selectedDate)}
        disabled={!selectedDate}
        className="bg-[#2A6F97] text-white hover:bg-[#2A6F97]/90 disabled:bg-gray-200"
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        Add Historical Entry
      </Button>
    </div>
  );
};

export default AddMetricsButton;
