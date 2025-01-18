import { Button } from "@/components/ui/button";
import { Edit2, Save, X } from "lucide-react";
import { TableCell } from "@/components/ui/table";

interface MetricRowActionsProps {
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

const MetricRowActions = ({ isEditing, onEdit, onSave, onCancel }: MetricRowActionsProps) => {
  return (
    <TableCell>
      {isEditing ? (
        <div className="flex gap-2">
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
        </div>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          onClick={onEdit}
        >
          <Edit2 className="h-4 w-4 text-[#2A6F97]" />
        </Button>
      )}
    </TableCell>
  );
};

export default MetricRowActions;