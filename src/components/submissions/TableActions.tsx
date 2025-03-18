
import { Button } from "@/components/ui/button";
import { Pencil, User, Trash2, FileDown, Calendar } from "lucide-react";
import { FormSubmission } from "@/types/form";

interface TableActionsProps {
  submission: FormSubmission;
  onEdit: (submission: FormSubmission) => void;
  onDelete: (submission: FormSubmission) => void;
  onViewProfile: (submission: FormSubmission) => void;
  onExportPDF: (submission: FormSubmission) => void;
  onBackdate?: (submission: FormSubmission) => void;
}

const TableActions = ({
  submission,
  onEdit,
  onDelete,
  onViewProfile,
  onExportPDF,
  onBackdate,
}: TableActionsProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onEdit(submission)}
        className="flex items-center gap-1"
      >
        <Pencil className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Edit</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onViewProfile(submission)}
        className="flex items-center gap-1"
      >
        <User className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Profile</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onExportPDF(submission)}
        className="flex items-center gap-1"
      >
        <FileDown className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">PDF</span>
      </Button>
      {onBackdate && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onBackdate(submission)}
          className="flex items-center gap-1"
        >
          <Calendar className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Date</span>
        </Button>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onDelete(submission)}
        className="flex items-center gap-1 text-red-600 hover:text-red-700"
      >
        <Trash2 className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Delete</span>
      </Button>
    </div>
  );
};

export default TableActions;
