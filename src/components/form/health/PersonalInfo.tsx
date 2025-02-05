import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/translations";
import { useEffect } from "react";
import { differenceInYears, parse } from "date-fns";

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

  useEffect(() => {
    if (formData.dob) {
      const birthDate = parse(formData.dob, 'yyyy-MM-dd', new Date());
      const calculatedAge = differenceInYears(new Date(), birthDate);
      handleInputChange('age', calculatedAge.toString());
    }
  }, [formData.dob]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
      <div className="md:col-span-5 space-y-2">
        <Label htmlFor="name">
          {t.fullName} <span className="text-red-500">*</span>
        </Label>
        <Input 
          id="name"
          value={formData.name || ''}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className="bg-gray-50"
        />
      </div>

      <div className="md:col-span-4 space-y-2">
        <Label htmlFor="dob">
          {t.dateOfBirth} <span className="text-red-500">*</span>
        </Label>
        <Input 
          id="dob"
          type="date"
          value={formData.dob || ''}
          onChange={(e) => handleInputChange('dob', e.target.value)}
          className="bg-gray-50"
        />
      </div>

      <div className="md:col-span-3 space-y-2">
        <Label htmlFor="age">
          {t.age}
        </Label>
        <Input 
          id="age"
          value={formData.age || ''}
          readOnly
          className="bg-gray-50 w-full"
        />
      </div>
    </div>
  );
};

export default PersonalInfo;