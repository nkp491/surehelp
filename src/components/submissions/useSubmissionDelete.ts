
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { FormSubmission } from "@/types/form";
import { supabase } from "@/integrations/supabase/client";
import { useRoleCheck } from "@/hooks/useRoleCheck";

export const useSubmissionDelete = () => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [submissionToDelete, setSubmissionToDelete] = useState<FormSubmission | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const { hasRequiredRole } = useRoleCheck();

  const handleDelete = (submission: FormSubmission) => {
    // Client-side role check
    if (!hasRequiredRole(['agent_pro', 'manager_pro', 'manager_pro_gold', 'manager_pro_platinum', 'beta_user', 'system_admin'])) {
      toast({
        title: "Access Denied",
        description: "You need Agent Pro or higher role to delete submissions.",
        variant: "destructive",
      });
      return;
    }
    
    setSubmissionToDelete(submission);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!submissionToDelete) return;
    
    setIsDeleting(true);
    
    try {
      // Server-side role verification through RPC
      const { data: hasPermission, error: permissionError } = await supabase.rpc(
        'has_delete_permission'
      );

      if (permissionError || !hasPermission) {
        toast({
          title: "Access Denied",
          description: "Server verification failed. You don't have permission to delete submissions.",
          variant: "destructive",
        });
        setIsDeleting(false);
        setDeleteDialogOpen(false);
        return;
      }

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
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setSubmissionToDelete(null);
    }
  };

  return {
    deleteDialogOpen,
    setDeleteDialogOpen,
    submissionToDelete,
    handleDelete,
    confirmDelete,
    isDeleting
  };
};
