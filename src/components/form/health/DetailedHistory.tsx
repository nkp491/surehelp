import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/translations";

interface DetailedHistoryProps {
  formData: any;
  setFormData: (value: any) => void;
}

const DetailedHistory = ({ formData, setFormData }: DetailedHistoryProps) => {
  const { language } = useLanguage();
  const t = translations[language];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{t.hospitalizations}</Label>
        <Textarea 
          className="min-h-[100px]"
          value={formData.hospitalizations || ''}
          onChange={(e) => handleInputChange('hospitalizations', e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>{t.surgeries}</Label>
        <Textarea 
          className="min-h-[100px]"
          value={formData.surgeries || ''}
          onChange={(e) => handleInputChange('surgeries', e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>{t.prescriptionMedications}</Label>
        <Textarea 
          className="min-h-[100px]"
          value={formData.prescriptionMedications || ''}
          onChange={(e) => handleInputChange('prescriptionMedications', e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>{t.lastMedicalExam}</Label>
        <Input 
          type="date"
          value={formData.lastMedicalExam || ''}
          onChange={(e) => handleInputChange('lastMedicalExam', e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>{t.familyMedicalConditions}</Label>
        <Textarea 
          className="min-h-[100px]"
          value={formData.familyMedicalConditions || ''}
          onChange={(e) => handleInputChange('familyMedicalConditions', e.target.value)}
        />
      </div>
    </div>
  );
};

export default DetailedHistory;