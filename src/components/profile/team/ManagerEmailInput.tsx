
import React from "react";
import TextField from "@/components/form-fields/TextField";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/translations";

interface ManagerEmailInputProps {
  managerEmail: string;
  onChange: (value: string) => void;
}

const ManagerEmailInput = ({ managerEmail, onChange }: ManagerEmailInputProps) => {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <TextField
      label=""
      type="email"
      value={managerEmail}
      onChange={onChange}
      placeholder={t.enterManagerEmail || "Enter manager's email"}
      className="mt-0"
    />
  );
};

export default ManagerEmailInput;
