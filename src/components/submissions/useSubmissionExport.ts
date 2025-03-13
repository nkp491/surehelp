
import { useToast } from "@/components/ui/use-toast";
import { FormSubmission } from "@/types/form";
import { useRoleCheck } from "@/hooks/useRoleCheck";
import { supabase } from "@/integrations/supabase/client";

export const useSubmissionExport = (submissions: FormSubmission[]) => {
  const { toast } = useToast();
  const { hasRequiredRole } = useRoleCheck();

  const handleExport = async () => {
    try {
      // First validate client-side that the user has the required role
      if (!hasRequiredRole(['agent_pro', 'manager_pro', 'manager_pro_gold', 'manager_pro_platinum', 'beta_user', 'system_admin'])) {
        toast({
          title: "Access Denied",
          description: "You need Agent Pro or higher role to export submissions.",
          variant: "destructive",
        });
        return;
      }
      
      if (!submissions.length) {
        toast({
          title: "Error",
          description: "No submissions to export",
          variant: "destructive",
        });
        return;
      }

      // Verify the role again on the server side through edge function
      const { data: hasPermission, error: permissionError } = await supabase.functions.invoke(
        'verify-export-permission'
      );

      if (permissionError || !hasPermission) {
        console.error("Permission error:", permissionError);
        toast({
          title: "Access Denied",
          description: "Server verification failed. You don't have permission to export data.",
          variant: "destructive",
        });
        return;
      }

      // Convert submissions to CSV format
      const headers = Object.keys(submissions[0]).join(',');
      const rows = submissions.map(submission => 
        Object.values(submission).map(value => 
          typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
        ).join(',')
      );
      const csv = [headers, ...rows].join('\n');

      // Create and trigger download
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', `submissions-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Submissions exported successfully",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Error",
        description: "Failed to export submissions",
        variant: "destructive",
      });
    }
  };

  return { handleExport };
};
