import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
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
    <div className="grid grid-cols-2 gap-4">
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
      <div className="space-y-2">
        <Label>{t.duiHistory}</Label>
        <Input 
          value={formData.dui || ''}
          onChange={(e) => handleInputChange('dui', e.target.value)}
        />
      </div>
    </div>
  );
};

export default HealthHistory;