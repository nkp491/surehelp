
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

  const updateSubmissionDate = async (submission: FormSubmission, newDate: Date) => {
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

      // Update the submission in Supabase
      const { error } = await supabase
        .from('submissions')
        .update({
          data: JSON.stringify({
            ...JSON.parse(typeof submission.data === 'string' ? submission.data : JSON.stringify(submission)),
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
      
      return true;
    } catch (error) {
      console.error("Error updating submission date:", error);
      toast({
        title: "Error",
        description: "Failed to update submission date",
        variant: "destructive",
      });
      return false;
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
