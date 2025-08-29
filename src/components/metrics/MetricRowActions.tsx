import { Button } from "@/components/ui/button";
import { Edit2, Save, X, Trash2, Loader2 } from "lucide-react";
import { TableCell } from "@/components/ui/table";

interface MetricRowActionsProps {
  isEditing: boolean;
  isSaving?: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
}

const MetricRowActions = ({
  isEditing,
  isSaving = false,
  onEdit,
  onSave,
  onCancel,
  onDelete,
}: MetricRowActionsProps) => {
  return (
    <TableCell>
      <div className="flex gap-2">
        {isEditing ? (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={onSave}
              disabled={isSaving}
              className="hover:bg-green-50"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 text-[#2A6F97] animate-spin" />
              ) : (
                <Save className="h-4 w-4 text-[#2A6F97]" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancel}
              disabled={isSaving}
              className="hover:bg-red-50"
            >
              <X className="h-4 w-4 text-[#2A6F97]" />
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" size="icon" onClick={onEdit}>
              <Edit2 className="h-4 w-4 text-[#2A6F97]" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </TableCell>
  );
};

export default MetricRowActions;
