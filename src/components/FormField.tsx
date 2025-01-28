import React from "react";
import HeightField from "./form-fields/HeightField";
import CurrencyField from "./form-fields/CurrencyField";
import SelectField from "./form-fields/SelectField";
import TextField from "./form-fields/TextField";

interface FormFieldProps {
  label: string;
  type: string;
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  readOnly?: boolean;
  options?: string[];
  submissionId?: string;
}

const FormField = ({
  label,
  type,
  value = "",
  onChange,
  placeholder,
  required = false,
  error,
  readOnly = false,
  options = [],
  submissionId,
}: FormFieldProps) => {
  const commonProps = {
    label,
    value,
    onChange,
    placeholder,
    required,
    error,
    readOnly,
    submissionId,
  };

  if (type === "height") {
    return <HeightField {...commonProps} />;
  }

  if (type === "currency") {
    return <CurrencyField {...commonProps} />;
  }

  if (type === "select" && options.length > 0) {
    return <SelectField {...commonProps} options={options} />;
  }

  if (type === "textarea") {
    return (
      <TextField
        {...commonProps}
        type="textarea"
        className="min-h-[120px] resize-none"
      />
    );
  }

  return <TextField {...commonProps} type={type} />;
};

export default FormField;