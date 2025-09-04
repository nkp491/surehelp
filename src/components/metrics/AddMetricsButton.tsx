import React from 'react';
import { Button } from "@/components/ui/button";
import { startOfDay } from "date-fns";
import { CustomeDatePicker } from '../custome-date-picker';
import { X } from "lucide-react";

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

  const handleClearDate = () => {
    onDateSelect(null);
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <CustomeDatePicker
          value={selectedDate}
          onChange={(dateString) => handleDateSelect(dateString ? new Date(dateString) : null)}
          startYear={1920}
          maxDate={new Date()}
        />
        {selectedDate && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClearDate}
            className="h-10 w-10 text-gray-500 hover:text-gray-700"
            title="Clear date"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Button
        onClick={() => selectedDate && onAdd(selectedDate)}
        disabled={!selectedDate}
        className="bg-[#2A6F97] text-white hover:bg-[#2A6F97]/90 disabled:bg-gray-200"
      >
        Add Historical Entry
      </Button>
    </div>
  );
};

export default AddMetricsButton;