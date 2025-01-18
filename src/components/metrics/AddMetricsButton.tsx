import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus } from "lucide-react";

interface AddMetricsButtonProps {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  onAdd: () => void;
}

const AddMetricsButton = ({ selectedDate, onDateSelect, onAdd }: AddMetricsButtonProps) => {
  return (
    <div className="flex justify-end mb-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <CalendarIcon className="h-4 w-4" />
            Add
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onDateSelect}
            initialFocus
          />
          <div className="p-2 border-t">
            <Button 
              className="w-full"
              onClick={onAdd}
              disabled={!selectedDate}
            >
              Add Entry
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default AddMetricsButton;