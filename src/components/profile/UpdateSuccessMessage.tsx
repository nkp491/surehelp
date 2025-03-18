
import { CheckCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/translations";

interface UpdateSuccessMessageProps {
  show: boolean;
}

export const UpdateSuccessMessage = ({ show }: UpdateSuccessMessageProps) => {
  const { language } = useLanguage();
  const t = translations[language];

  if (!show) return null;

  return (
    <div className="flex items-center text-green-600 text-sm mr-2">
      <CheckCircle className="h-4 w-4 mr-1" />
      <span>{t.savedSuccessfully}</span>
    </div>
  );
};
