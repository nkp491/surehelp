import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/translations";
import { DatePicker } from "@/components/ui/date-picker";
import { FormSubmission } from "@/types/form";

interface DetailedHistoryProps {
  formData: Partial<FormSubmission>;
  setFormData: (value: Partial<FormSubmission>) => void;
}

const DetailedHistory = ({ formData, setFormData }: DetailedHistoryProps) => {
  const { language } = useLanguage();
  const t = translations[language];

  const handleInputChange = (field: keyof FormSubmission, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleDateSelect = (date: Date | null) => {
    if (date) {
      handleInputChange("lastMedicalExam", date.toISOString().split("T")[0]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{t.hospitalizations}</Label>
        <Textarea
          className="min-h-[100px]"
          value={formData.hospitalizations || ""}
          onChange={(e) => handleInputChange("hospitalizations", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>{t.surgeries}</Label>
        <Textarea
          className="min-h-[100px]"
          value={formData.surgeries || ""}
          onChange={(e) => handleInputChange("surgeries", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>{t.prescriptionMedications}</Label>
        <Textarea
          className="min-h-[100px]"
          value={formData.prescriptionMedications || ""}
          onChange={(e) => handleInputChange("prescriptionMedications", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>{t.lastMedicalExam}</Label>
        <div
          className="cursor-pointer"
          onClick={(e) => {
            // Find the input or button inside and click it
            const input = e.currentTarget.querySelector('input');
            const button = e.currentTarget.querySelector('button');

            if (input) {
              input.focus();
              input.click();
            } else if (button) {
              button.click();
            }
          }}
        >
          <DatePicker
            selected={formData.lastMedicalExam ? new Date(formData.lastMedicalExam) : null}
            onSelect={handleDateSelect}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>{t.familyMedicalConditions}</Label>
        <Textarea
          className="min-h-[100px]"
          value={formData.familyMedicalConditions || ""}
          onChange={(e) => handleInputChange("familyMedicalConditions", e.target.value)}
        />
      </div>
    </div>
  );
};

export default DetailedHistory;
