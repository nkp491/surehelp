
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { FormSubmission } from "@/types/form";
import { supabase } from "@/integrations/supabase/client";
import { useRoleCheck } from "@/hooks/useRoleCheck";

export const useSubmissionDelete = () => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [submissionToDelete, setSubmissionToDelete] = useState<FormSubmission | null>(null);
  const { toast } = useToast();
  const { hasRequiredRole } = useRoleCheck();

  const handleDelete = (submission: FormSubmission) => {
    // Only allow deletion for agent_pro and above
    if (!hasRequiredRole(['agent_pro', 'manager_pro', 'manager_pro_gold', 'manager_pro_platinum', 'beta_user', 'system_admin'])) {
      toast({
        title: "Upgrade Required",
        description: "Deleting submissions requires Agent Pro or higher.",
        variant: "destructive",
      });
      return;
    }
    
    setSubmissionToDelete(submission);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (submissionToDelete) {
      try {
        const { error } = await supabase
          .from('submissions')
          .delete()
          .eq('timestamp', submissionToDelete.timestamp);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Form submission deleted successfully",
        });

        window.location.reload();
      } catch (error) {
        console.error("Error deleting submission:", error);
        toast({
          title: "Error",
          description: "Failed to delete submission",
          variant: "destructive",
        });
      }
    }
    setDeleteDialogOpen(false);
    setSubmissionToDelete(null);
  };

  return {
    deleteDialogOpen,
    setDeleteDialogOpen,
    submissionToDelete,
    handleDelete,
    confirmDelete
  };
};
