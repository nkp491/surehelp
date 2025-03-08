import React from "react";
import DraggableFormField from "../DraggableFormField";

interface DraggableFieldProps {
  id: string;
  fieldType: string;
  label: string;
  value: any;
  onChange: (value: any) => void;
  width?: string;
  height?: string;
  alignment?: string;
  onSelect: () => void;
  isSelected: boolean;
  style?: React.CSSProperties;
  investmentAmounts?: Record<string, string>;
  onInvestmentAmountChange?: (type: string, amount: string) => void;
}

const DraggableField = ({
  id,
  fieldType,
  label,
  value,
  onChange,
  width = "100%",
  height = "auto",
  alignment = "left",
  style = {},
  investmentAmounts = {},
  onInvestmentAmountChange = () => {},
}: DraggableFieldProps) => {
  const combinedStyle = {
    ...style,
    width,
    height,
    textAlign: alignment as "left" | "center" | "right",
    position: "relative" as const,
    minHeight: "40px",
    maxHeight: "100px",
  };

  return (
    <div
      style={combinedStyle}
      className="form-field-container"
      data-field-id={id}
    >
      <DraggableFormField
        id={id}
        fieldType={fieldType}
        label={label}
        value={value}
        onChange={onChange}
        investmentAmounts={investmentAmounts}
        onInvestmentAmountChange={onInvestmentAmountChange}
      />
    </div>
  );
};

export default DraggableField;