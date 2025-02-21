import { TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

interface EditableMetricCellProps {
  isEditing: boolean;
  value: string;
  onChange: (value: string) => void;
  metric: string;
}

const EditableMetricCell = ({ isEditing, value, onChange, metric }: EditableMetricCellProps) => {
  const [inputValue, setInputValue] = useState('');
  
  useEffect(() => {
    if (isEditing && metric === 'ap') {
      // Initialize input value when editing starts
      setInputValue((Number(value) / 100).toFixed(2));
    }
  }, [isEditing, value, metric]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    if (metric === 'ap') {
      // Allow empty input or numbers with up to one decimal point
      if (newValue === '' || /^\d*\.?\d*$/.test(newValue)) {
        setInputValue(newValue);
        
        // Convert to cents for storage only if we have a valid number
        const numericValue = parseFloat(newValue);
        if (!isNaN(numericValue)) {
          const centsValue = Math.round(numericValue * 100);
          onChange(centsValue.toString());
        } else {
          onChange('0');
        }
      }
    } else {
      // For non-AP metrics, just ensure it's a valid number
      if (newValue === '' || !isNaN(Number(newValue))) {
        onChange(newValue === '' ? '0' : newValue);
      }
    }
  };

  const formatDisplayValue = (val: string) => {
    if (metric === 'ap') {
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(Number(val) / 100);
    }
    return val;
  };

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
            type={metric === 'ap' ? 'text' : 'number'}
            value={metric === 'ap' ? inputValue : value}
            onChange={handleChange}
            className={`w-24 ${metric === 'ap' ? 'pl-6' : ''}`}
            autoFocus
          />
        </div>
      ) : (
        <div className="text-center">
          {metric === 'ap' ? (
            <span className="text-green-600 font-medium">
              ${formatDisplayValue(value)}
            </span>
          ) : value}
        </div>
      )}
    </TableCell>
  );
};

export default EditableMetricCell;