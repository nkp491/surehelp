import FormField from "./FormField";
import MedicalConditionsCheckbox from "./MedicalConditionsCheckbox";
import EmploymentStatusCheckbox from "./EmploymentStatusCheckbox";
import InvestmentTypesCheckbox from "./InvestmentTypesCheckbox";
import TobaccoUseField from "./form-fields/TobaccoUseField";
import TotalIncomeField from "./form-fields/TotalIncomeField";
import { useEffect, useState } from "react";

interface DraggableFormFieldProps {
  id: string;
  fieldType: string;
  label: string;
  value: any;
  onChange: (value: any) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  submissionId?: string;
  investmentAmounts?: Record<string, string>;
  onInvestmentAmountChange?: (type: string, amount: string) => void;
  onInvestmentTotalChange?: (total: number) => void;
  formData?: any; // Added for TotalIncomeField
}

const DraggableFormField = ({
  id,
  fieldType,
  label,
  value,
  onChange,
  placeholder,
  required,
  error,
  submissionId,
  investmentAmounts = {},
  onInvestmentAmountChange = () => {},
  onInvestmentTotalChange = () => {},
  formData = {}, // Default to empty object
}: DraggableFormFieldProps) => {
  // Keep a local copy of investment amounts for better state management
  const [localInvestmentAmounts, setLocalInvestmentAmounts] = useState<Record<string, string>>(investmentAmounts);

  // Update local state when props change
  useEffect(() => {
    setLocalInvestmentAmounts(prev => ({
      ...prev,
      ...investmentAmounts
    }));
  }, [investmentAmounts]);

  // Handle investment amount changes
  const handleInvestmentAmountChange = (type: string, amount: string) => {
    console.log(`DraggableFormField (${id}) - Amount change for ${type}:`, amount);
    
    // Update local state
    setLocalInvestmentAmounts(prev => ({
      ...prev,
      [type]: amount
    }));
    
    // Notify parent
    onInvestmentAmountChange(type, amount);
  };

  // Handle investment total changes
  const handleInvestmentTotalChange = (total: number) => {
    console.log(`DraggableFormField (${id}) - Total change:`, total);
    onInvestmentTotalChange(total);
  };

  const renderField = () => {
    switch (fieldType) {
      case "medicalConditions":
        return (
          <MedicalConditionsCheckbox
            selectedConditions={value}
            onChange={onChange}
          />
        );
      case "employmentStatus":
        return (
          <EmploymentStatusCheckbox
            selectedStatus={value}
            onChange={onChange}
          />
        );
      case "investmentTypes":
        console.log(`DraggableFormField (${id}) - Rendering InvestmentTypesCheckbox with:`, {
          selectedInvestments: value,
          investmentAmounts: localInvestmentAmounts
        });
        
        return (
          <InvestmentTypesCheckbox
            selectedInvestments={value}
            onChange={onChange}
            investmentAmounts={localInvestmentAmounts}
            onAmountChange={handleInvestmentAmountChange}
            onTotalChange={handleInvestmentTotalChange}
          />
        );
      case "tobaccoUse":
        return (
          <TobaccoUseField
            value={value}
            onChange={onChange}
          />
        );
      // Special case for totalIncome field
      case "currency":
        // Check for primaryTotalIncome field
        if (id === "primaryTotalIncome") {
          console.log(`DraggableFormField (${id}) - Rendering TotalIncomeField with formData:`, formData);
          return (
            <TotalIncomeField
              label={label}
              formData={formData}
              placeholder={placeholder}
              required={required}
              error={error}
            />
          );
        }
        // Fall through to default for other currency fields
      default:
        return (
          <FormField
            label={label}
            type={fieldType}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            error={error}
            submissionId={submissionId}
          />
        );
    }
  };

  return (
    <div className="w-full">
      {renderField()}
    </div>
  );
};

export default DraggableFormField;
