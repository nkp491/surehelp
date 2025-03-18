
import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { FormSubmission } from "@/types/form";
import { Input } from "@/components/ui/input";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface BackdateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  submission: FormSubmission | null;
  onConfirm: (submission: FormSubmission, newDate: Date) => Promise<void>;
}

export function BackdateDialog({ 
  isOpen, 
  onOpenChange, 
  submission, 
  onConfirm 
}: BackdateDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    submission ? parseISO(submission.timestamp) : null
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Reset the selected date when the submission changes
  useEffect(() => {
    if (submission) {
      setSelectedDate(parseISO(submission.timestamp));
    }
  }, [submission]);

  const handleConfirm = async () => {
    if (submission && selectedDate) {
      setIsUpdating(true);
      try {
        await onConfirm(submission, selectedDate);
        onOpenChange(false);
      } catch (error) {
        console.error("Error updating submission date:", error);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleManualDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputDate = e.target.value;
    
    // Only try to parse if we have a complete date format
    if (inputDate.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const [month, day, year] = inputDate.split('/').map(Number);
      
      // JavaScript months are 0-indexed
      const date = new Date(year, month - 1, day);
      
      // Validate the date is valid and not in the future
      if (!isNaN(date.getTime()) && date <= new Date()) {
        setSelectedDate(date);
      }
    }
  };

  const formatSelectedDate = () => {
    return selectedDate ? format(selectedDate, "MM/dd/yyyy") : "";
  };

  const originalDate = submission ? format(parseISO(submission.timestamp), "MMM dd, yyyy") : "";
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Submission Date</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Current submission date: <span className="font-medium text-foreground">{originalDate}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Client: <span className="font-medium text-foreground">{submission?.name || "N/A"}</span>
            </p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">New Submission Date</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="MM/DD/YYYY"
                  value={formatSelectedDate()}
                  onChange={handleManualDateInput}
                  className="pr-10"
                />
              </div>
              
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="px-3"
                    aria-label="Pick a date"
                  >
                    <CalendarIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={selectedDate || undefined}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      setCalendarOpen(false);
                    }}
                    disabled={(date) => date > new Date()}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <p className="text-sm text-amber-600">
            Note: Changing the submission date will affect reporting and analytics.
          </p>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!selectedDate || (submission && selectedDate?.toISOString() === submission.timestamp) || isUpdating}
          >
            {isUpdating ? "Updating..." : "Update Date"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
