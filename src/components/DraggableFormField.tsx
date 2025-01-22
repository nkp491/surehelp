import FormField from "./FormField";
import MedicalConditionsCheckbox from "./MedicalConditionsCheckbox";
import EmploymentStatusCheckbox from "./EmploymentStatusCheckbox";
import InvestmentTypesCheckbox from "./InvestmentTypesCheckbox";
import TobaccoUseField from "./form-fields/TobaccoUseField";

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
}: DraggableFormFieldProps) => {
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
        return (
          <InvestmentTypesCheckbox
            selectedInvestments={value}
            onChange={onChange}
          />
        );
      case "tobaccoUse":
        return (
          <TobaccoUseField
            value={value}
            onChange={onChange}
          />
        );
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

  return renderField();
};

export default DraggableFormField;