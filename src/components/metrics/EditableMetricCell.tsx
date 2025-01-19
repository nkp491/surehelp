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
    const inputValue = e.target.value;
    
    if (metric === 'ap') {
      // Convert the dollar input to cents for storage
      const numericValue = parseFloat(inputValue);
      if (!isNaN(numericValue)) {
        const centsValue = Math.round(numericValue * 100);
        onChange(centsValue.toString());
      } else if (inputValue === '') {
        onChange('0');
      }
    } else {
      // For non-AP metrics, just ensure it's a valid number
      if (inputValue === '' || !isNaN(Number(inputValue))) {
        onChange(inputValue === '' ? '0' : inputValue);
      }
    }
  };

  const displayValue = metric === 'ap' ? 
    (Number(value) / 100).toFixed(2) : 
    value;

  return (
    <TableCell className="text-[#2A6F97]">
      {isEditing ? (
        <div className="relative">
          {metric === 'ap' && (
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
              $
            </span>
          )}
          <Input
            type="text"
            value={displayValue}
            onChange={handleChange}
            className={`w-24 ${metric === 'ap' ? 'pl-6' : ''}`}
            autoFocus
          />
        </div>
      ) : (
        <span>{metric === 'ap' ? `$${displayValue}` : displayValue}</span>
      )}
    </TableCell>
  );
};

export default EditableMetricCell;