import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/translations";

interface HealthMetricsProps {
  formData: any;
  setFormData: (value: any) => void;
}

const HealthMetrics = ({ formData, setFormData }: HealthMetricsProps) => {
  const { language } = useLanguage();
  const t = translations[language];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="space-y-2">
        <Label htmlFor="dob">
          {t.dateOfBirth} <span className="text-red-500">*</span>
        </Label>
        <Input 
          id="dob"
          type="date"
          value={formData.dob || ''}
          onChange={(e) => handleInputChange('dob', e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="age">{t.age}</Label>
        <Input 
          id="age"
          value={formData.age || ''}
          readOnly
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="height">{t.height}</Label>
        <div className="flex gap-2">
          <Input 
            id="height-ft"
            className="w-16"
            value={formData.heightFt || ''}
            onChange={(e) => handleInputChange('heightFt', e.target.value)}
          />
          <span className="self-center text-xs">{t.feet}</span>
          <Input 
            id="height-in"
            className="w-16"
            value={formData.heightIn || ''}
            onChange={(e) => handleInputChange('heightIn', e.target.value)}
          />
          <span className="self-center text-xs">{t.inches}</span>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="weight">{t.weight}</Label>
        <div className="flex gap-2">
          <Input 
            id="weight"
            value={formData.weight || ''}
            onChange={(e) => handleInputChange('weight', e.target.value)}
          />
          <span className="self-center text-xs">{t.pounds}</span>
        </div>
      </div>
    </div>
  );
};

export default HealthMetrics;