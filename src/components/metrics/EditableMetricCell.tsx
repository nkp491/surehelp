import {TableCell} from "@/components/ui/table";
import {Input} from "@/components/ui/input";
import {useEffect, useState} from "react";

interface EditableMetricCellProps {
  isEditing: boolean;
  value: string;
  onChange: (value: string) => void;
  metric: string;
}

const EditableMetricCell = ({
  isEditing,
  value,
  onChange,
  metric,
}: EditableMetricCellProps) => {
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (isEditing && metric === "ap") {
      const numericValue = Number(value);
      setInputValue(numericValue === 0 ? "" : numericValue.toString());
    }
  }, [isEditing, value, metric]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    if (metric === "ap") {
      if (newValue === "" || /^\d*\.?\d{0,2}$/.test(newValue)) {
        setInputValue(newValue);
        const numericValue = parseFloat(newValue);
        if (!isNaN(numericValue)) {
          onChange(numericValue.toString());
        } else if (newValue === "") {
          onChange("0");
        }
      }
    } else if (newValue === "" || !isNaN(Number(newValue))) {
      onChange(newValue === "" ? "0" : newValue);
    }
  };

  const formatDisplayValue = (val: string) => {
    if (metric === "ap") {
      const numericVal = Number(val);
        return new Intl.NumberFormat("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
      }).format(numericVal);
    }
    return val;
  };

  return (
    <TableCell className="text-[#2A6F97]">
      {isEditing ? (
        <div className="relative">
          {metric === "ap" && (
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
              $
            </span>
          )}
          <Input
            type={metric === "ap" ? "text" : "number"}
            value={metric === "ap" ? inputValue : value}
            onChange={handleChange}
            className={`w-24 ${metric === "ap" ? "pl-6" : ""}`}
            autoFocus
          />
        </div>
      ) : (
        <div className="text-center">
          {metric === "ap" ? (
            <span className="text-green-600 font-medium">
              ${formatDisplayValue(value)}
            </span>
          ) : (
            value
          )}
        </div>
      )}
    </TableCell>
  );
};

export default EditableMetricCell;
