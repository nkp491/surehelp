import { TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";

interface EditableMetricCellProps {
  isEditing: boolean;
  value: string;
  onChange: (value: string) => void;
  metric: string;
}

const EditableMetricCell = ({ isEditing, value, onChange, metric }: EditableMetricCellProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // Allow empty string or valid numbers
    if (newValue === '' || !isNaN(Number(newValue))) {
      onChange(newValue);
    }
  };

  const displayValue = metric === 'ap' ? 
    (Number(value) / 100).toFixed(2) : 
    value;

  return (
    <TableCell className="text-[#2A6F97]">
      {isEditing ? (
        <Input
          type="text"
          value={displayValue}
          onChange={handleChange}
          className="w-24"
          autoFocus
        />
      ) : (
        <span>{metric === 'ap' ? `$${displayValue}` : displayValue}</span>
      )}
    </TableCell>
  );
};

export default EditableMetricCell;