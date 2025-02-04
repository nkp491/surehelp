import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/translations";

interface HealthHistoryProps {
  formData: any;
  setFormData: (value: any) => void;
}

const HealthHistory = ({ formData, setFormData }: HealthHistoryProps) => {
  const { language } = useLanguage();
  const t = translations[language];

  return null; // Component no longer needed since its only field was moved
};

export default HealthHistory;