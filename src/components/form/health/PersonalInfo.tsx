
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/translations";
import { useEffect } from "react";
import { differenceInYears } from "date-fns";
import { DatePicker } from "@/components/ui/date-picker";

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

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // Store date as ISO string to maintain compatibility with existing data structure
      handleInputChange('dob', date.toISOString().split('T')[0]);
    }
  };

  useEffect(() => {
    if (formData.dob) {
      const birthDate = new Date(formData.dob);
      const calculatedAge = differenceInYears(new Date(), birthDate);
      handleInputChange('age', calculatedAge.toString());
    }
  }, [formData.dob]);

  // Calculate max date (today) and min date (120 years ago)
  const today = new Date();
  const minDate = new Date();
  minDate.setFullYear(today.getFullYear() - 120);

  return (
    <div className="space-y-6">
      {/* Full Name Row */}
      <div className="w-full space-y-2">
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

      {/* Date of Birth and Age Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-8 space-y-2">
          <Label htmlFor="dob">
            {t.dateOfBirth} <span className="text-red-500">*</span>
          </Label>
          <DatePicker
            selected={formData.dob ? new Date(formData.dob) : undefined}
            onSelect={handleDateSelect}
            maxDate={today}
          />
        </div>

        <div className="md:col-span-4 space-y-2">
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
    </div>
  );
};

export default PersonalInfo;
