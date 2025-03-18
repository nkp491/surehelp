
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FormSubmission } from "@/types/form";
import { useToast } from "@/components/ui/use-toast";
import { useAuditTrail } from "./useAuditTrail";

export const useSubmissionBackdate = () => {
  const [backdateDialogOpen, setBackdateDialogOpen] = useState(false);
  const [submissionToBackdate, setSubmissionToBackdate] = useState<FormSubmission | null>(null);
  const { toast } = useToast();
  const { createAuditEntry } = useAuditTrail();

  const handleBackdate = (submission: FormSubmission) => {
    setSubmissionToBackdate(submission);
    setBackdateDialogOpen(true);
  };

  const updateSubmissionDate = async (submission: FormSubmission, newDate: Date): Promise<void> => {
    try {
      const originalTimestamp = submission.timestamp;
      const newTimestamp = newDate.toISOString();
      
      // Create an audit entry for the change
      const auditEntry = createAuditEntry(
        { timestamp: originalTimestamp },
        { timestamp: newTimestamp },
        'updated'
      );
      
      const auditTrail = [
        ...(submission.auditTrail || []),
        auditEntry
      ];

      // Need to prepare the submission data properly
      // Since FormSubmission object matches what we store in Supabase but doesn't have a data property
      const { error } = await supabase
        .from('submissions')
        .update({
          // Extract all properties except timestamp and outcome that will be stored directly
          data: JSON.stringify({
            ...Object.fromEntries(
              Object.entries(submission).filter(([key]) => 
                key !== 'timestamp' && key !== 'outcome'
              )
            ),
            auditTrail
          }),
          timestamp: newTimestamp
        })
        .eq('timestamp', originalTimestamp);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Submission date updated successfully",
      });
    } catch (error) {
      console.error("Error updating submission date:", error);
      toast({
        title: "Error",
        description: "Failed to update submission date",
        variant: "destructive",
      });
    }
  };

  return {
    backdateDialogOpen,
    setBackdateDialogOpen,
    submissionToBackdate,
    handleBackdate,
    updateSubmissionDate
  };
};
