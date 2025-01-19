import { Button } from "@/components/ui/button";
import { Edit2, Save, X, Trash2 } from "lucide-react";
import { TableCell } from "@/components/ui/table";

interface MetricRowActionsProps {
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
}

const MetricRowActions = ({ isEditing, onEdit, onSave, onCancel, onDelete }: MetricRowActionsProps) => {
  return (
    <TableCell>
      <div className="flex gap-2">
        {isEditing ? (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={onSave}
            >
              <Save className="h-4 w-4 text-[#2A6F97]" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancel}
            >
              <X className="h-4 w-4 text-[#2A6F97]" />
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
            >
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