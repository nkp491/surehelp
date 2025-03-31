import { Button } from "@/components/ui/button";
import { Pencil, User, Trash2, FileDown } from "lucide-react";
import { FormSubmission } from "@/types/form";

interface TableActionsProps {
  submission: FormSubmission;
  onEdit: (submission: FormSubmission) => void;
  onDelete: (submission: FormSubmission) => void;
  onViewProfile: (submission: FormSubmission) => void;
  onExportPDF: (submission: FormSubmission) => void;
}

const TableActions = ({
  submission,
  onEdit,
  onDelete,
  onViewProfile,
  onExportPDF,
}: TableActionsProps) => {
  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onEdit(submission)}
        className="flex items-center gap-2"
      >
        <Pencil className="h-4 w-4" />
        Edit
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onViewProfile(submission)}
        className="flex items-center gap-2"
      >
        <User className="h-4 w-4" />
        Profile
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onExportPDF(submission)}
        className="flex items-center gap-2"
      >
        <FileDown className="h-4 w-4" />
        PDF
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onDelete(submission)}
        className="flex items-center gap-2 text-red-600 hover:text-red-700"
      >
        <Trash2 className="h-4 w-4" />
        Delete
      </Button>
    </div>
  );
};

export default TableActions;