import { TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";

interface EditableMetricCellProps {
  isEditing: boolean;
  value: string;
  onChange: (value: string) => void;
  metric: string;
}

const EditableMetricCell = ({ isEditing, value, onChange, metric }: EditableMetricCellProps) => {
  return (
    <TableCell className="text-[#2A6F97]">
      {isEditing ? (
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-24"
        />
      ) : (
        value
      )}
    </TableCell>
  );
};

export default EditableMetricCell;