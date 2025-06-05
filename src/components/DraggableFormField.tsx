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
  formData?: any;
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
  formData = {},
}: DraggableFormFieldProps) => {
  const [localInvestmentAmounts, setLocalInvestmentAmounts] =
    useState<Record<string, string>>(investmentAmounts);

  useEffect(() => {
    const isDifferent =
      Object.keys(investmentAmounts).some(
        (key) => investmentAmounts[key] !== localInvestmentAmounts[key]
      ) ||
      Object.keys(localInvestmentAmounts).some(
        (key) => localInvestmentAmounts[key] !== investmentAmounts[key]
      );
    if (isDifferent) {
      setLocalInvestmentAmounts(investmentAmounts);
    }
  }, [investmentAmounts]);

  const handleInvestmentAmountChange = (type: string, amount: string) => {
    setLocalInvestmentAmounts((prev) => ({
      ...prev,
      [type]: amount,
    }));
    onInvestmentAmountChange(type, amount);
  };

  const handleInvestmentTotalChange = (total: number) => {
    onInvestmentTotalChange(total);
  };

  const renderField = () => {
    switch (fieldType) {
      case "medicalConditions":
        return <MedicalConditionsCheckbox selectedConditions={value} onChange={onChange} />;
      case "employmentStatus":
        return <EmploymentStatusCheckbox selectedStatus={value} onChange={onChange} />;
      case "investmentTypes":
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
        return <TobaccoUseField value={value} onChange={onChange} />;
      case "currency":
        if (id === "primaryTotalIncome") {
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
        break;
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

  return <div className="w-full">{renderField()}</div>;
};

export default DraggableFormField;
