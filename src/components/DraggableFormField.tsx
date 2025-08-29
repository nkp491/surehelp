import React, { useState, useEffect } from "react";
import FormField from "./FormField";
import MedicalConditionsCheckbox from "./MedicalConditionsCheckbox";
import EmploymentStatusCheckbox from "./EmploymentStatusCheckbox";
import InvestmentTypesCheckbox from "./InvestmentTypesCheckbox";
import TobaccoUseField from "./form-fields/TobaccoUseField";
import TotalIncomeField from "./form-fields/TotalIncomeField";

interface DraggableFormFieldProps {
  id: string;
  fieldType: string;
  label: string;
  value: string | string[];
  onChange?: (value: string | string[]) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  submissionId?: string;
  formData?: Record<string, string>;
  investmentAmounts?: Record<string, string>;
  onInvestmentAmountChange?: (type: string, amount: string) => void;
  onInvestmentTotalChange?: (total: number) => void;
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
  formData,
  investmentAmounts = {},
  onInvestmentAmountChange = () => {},
  onInvestmentTotalChange = () => {},
}: DraggableFormFieldProps) => {
  const [localInvestmentAmounts, setLocalInvestmentAmounts] =
    useState(investmentAmounts);

  useEffect(() => {
    setLocalInvestmentAmounts(investmentAmounts);
  }, [investmentAmounts]);

  const handleInvestmentAmountChange = (type: string, amount: string) => {
    const updatedAmounts = { ...localInvestmentAmounts, [type]: amount };
    setLocalInvestmentAmounts(updatedAmounts);
    onInvestmentAmountChange(type, amount);
  };

  const handleInvestmentTotalChange = (total: number) => {
    onInvestmentTotalChange(total);
  };

  const renderField = () => {
    switch (fieldType) {
      case "medicalConditions":
        return (
          <MedicalConditionsCheckbox
            selectedConditions={Array.isArray(value) ? value : []}
            onChange={(conditions) => onChange?.(conditions)}
          />
        );
      case "employmentStatus":
        return (
          <EmploymentStatusCheckbox
            selectedStatus={Array.isArray(value) ? value : []}
            onChange={(status) => onChange?.(status)}
          />
        );
      case "investmentTypes":
        return (
          <InvestmentTypesCheckbox
            selectedInvestments={Array.isArray(value) ? value : []}
            onChange={(investments) => onChange?.(investments)}
            investmentAmounts={localInvestmentAmounts}
            onAmountChange={handleInvestmentAmountChange}
            onTotalChange={handleInvestmentTotalChange}
          />
        );
      case "tobaccoUse":
        return (
          <TobaccoUseField
            value={typeof value === "string" ? value : ""}
            onChange={onChange}
          />
        );
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
            value={typeof value === "string" ? value : ""}
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
    <div className="w-full transition-all duration-200">{renderField()}</div>
  );
};

export default DraggableFormField;
