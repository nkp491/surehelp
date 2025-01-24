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
  if (type === "height") {
    return (
      <HeightField
        value={value}
        onChange={onChange}
        required={required}
        error={error}
        readOnly={readOnly}
      />
    );
  }

  if (type === "currency") {
    return (
      <CurrencyField
        label={label}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        error={error}
        readOnly={readOnly}
      />
    );
  }

  if (type === "select" && options.length > 0) {
    return (
      <SelectField
        label={label}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        error={error}
        readOnly={readOnly}
        options={options}
      />
    );
  }

  return (
    <TextField
      label={label}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      error={error}
      readOnly={readOnly}
      submissionId={submissionId}
    />
  );
};

export default FormField;