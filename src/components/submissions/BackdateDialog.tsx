
import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { FormSubmission } from "@/types/form";

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
          
          <DatePicker
            selected={selectedDate}
            onSelect={setSelectedDate}
            maxDate={new Date()}
            label="New Submission Date"
          />
          
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
