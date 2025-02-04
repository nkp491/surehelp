import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/translations";

interface HealthHistoryProps {
  formData: any;
  setFormData: (value: any) => void;
}

const HealthHistory = ({ formData, setFormData }: HealthHistoryProps) => {
  const { language } = useLanguage();
  const t = translations[language];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-2">
      <Label>{t.tobaccoUse}</Label>
      <RadioGroup 
        value={formData.tobaccoUse || 'no'}
        onValueChange={(value) => handleInputChange('tobaccoUse', value)}
        className="flex gap-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="yes" id="tobacco-yes" />
          <Label htmlFor="tobacco-yes">{t.yes}</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="no" id="tobacco-no" />
          <Label htmlFor="tobacco-no">{t.no}</Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default HealthHistory;
