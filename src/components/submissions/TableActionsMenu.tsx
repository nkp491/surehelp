
import { useToast } from "@/components/ui/use-toast";
import { FormSubmission } from "@/types/form";
import { Button } from "@/components/ui/button";
import { Download, Trash2 } from "lucide-react";
import { useRoleCheck } from "@/hooks/useRoleCheck";
import { useSubmissionExport } from "./useSubmissionExport";
import { useSubmissionDelete } from "./useSubmissionDelete";

interface TableActionsMenuProps {
  submissions: FormSubmission[];
  onExport: () => void;
}

const TableActionsMenu = ({ submissions, onExport }: TableActionsMenuProps) => {
  const { toast } = useToast();
  const { hasRequiredRole } = useRoleCheck();
  const { handleDelete, deleteDialogOpen, setDeleteDialogOpen, submissionToDelete, confirmDelete } = useSubmissionDelete();
  
  const showAdvancedFiltering = hasRequiredRole(['agent_pro', 'manager_pro', 'manager_pro_gold', 'manager_pro_platinum', 'beta_user', 'system_admin']);

  return (
    <div className="flex items-center gap-4">
      {showAdvancedFiltering ? (
        <Button
          onClick={onExport}
          className="flex items-center gap-2"
          variant="outline"
          disabled={!submissions.length}
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      ) : (
        <Button
          onClick={() => {
            toast({
              title: "Pro Feature",
              description: "Please upgrade to Agent Pro or higher to export submissions.",
              variant: "destructive",
            });
          }}
          className="flex items-center gap-2"
          variant="outline"
        >
          <Download className="h-4 w-4" />
          Pro Feature
        </Button>
      )}
    </div>
  );
};

export default TableActionsMenu;
