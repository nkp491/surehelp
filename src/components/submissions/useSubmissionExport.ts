
import { useToast } from "@/components/ui/use-toast";
import { FormSubmission } from "@/types/form";
import { useRoleCheck } from "@/hooks/useRoleCheck";

export const useSubmissionExport = (submissions: FormSubmission[]) => {
  const { toast } = useToast();
  const { hasRequiredRole } = useRoleCheck();

  const handleExport = () => {
    // Restrict export functionality to agent_pro and above
    if (!hasRequiredRole(['agent_pro', 'manager_pro', 'manager_pro_gold', 'manager_pro_platinum', 'beta_user', 'system_admin'])) {
      toast({
        title: "Upgrade Required",
        description: "Exporting submissions requires Agent Pro or higher.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      if (!submissions.length) {
        toast({
          title: "Error",
          description: "No submissions to export",
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
      toast({
        title: "Error",
        description: "Failed to export submissions",
        variant: "destructive",
      });
    }
  };

  return { handleExport };
};
