import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/translations";

interface PersonalInfoProps {
  formData: any;
  setFormData: (value: any) => void;
}

const PersonalInfo = ({ formData, setFormData }: PersonalInfoProps) => {
  const { language } = useLanguage();
  const t = translations[language];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="name">
          {t.fullName} <span className="text-red-500">*</span>
        </Label>
        <Input 
          id="name"
          value={formData.name || ''}
          onChange={(e) => handleInputChange('name', e.target.value)}
        />
      </div>
    </div>
  );
};

export default PersonalInfo;