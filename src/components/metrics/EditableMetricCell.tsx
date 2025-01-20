import { TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface EditableMetricCellProps {
  isEditing: boolean;
  value: string;
  onChange: (value: string) => void;
  metric: string;
  className?: string;
}

const EditableMetricCell = ({
  isEditing,
  value,
  onChange,
  metric,
  className
}: EditableMetricCellProps) => {
  return (
    <TableCell className={cn("font-medium", className)}>
      {isEditing && metric !== "date" ? (
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-24"
          min="0"
        />
      ) : (
        <span>{metric === 'ap' && value !== '0' ? `$${value}` : value}</span>
      )}
    </TableCell>
  );
};

export default EditableMetricCell;