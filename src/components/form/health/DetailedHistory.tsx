import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
      <div>
        <Label>{t.hospitalizations}</Label>
        <Textarea
          value={formData.hospitalizations || ""}
          onChange={(e) => handleInputChange("hospitalizations", e.target.value)}
          className="mt-1"
        />
      </div>
      <div>
        <Label>{t.surgeries}</Label>
        <Textarea
          value={formData.surgeries || ""}
          onChange={(e) => handleInputChange("surgeries", e.target.value)}
          className="mt-1"
        />
      </div>
      <div>
        <Label>{t.prescriptionMedications}</Label>
        <Textarea
          value={formData.prescriptionMedications || ""}
          onChange={(e) => handleInputChange("prescriptionMedications", e.target.value)}
          className="mt-1"
        />
      </div>
      <div>
        <Label>{t.familyMedicalConditions}</Label>
        <Textarea
          value={formData.familyMedicalConditions || ""}
          onChange={(e) => handleInputChange("familyMedicalConditions", e.target.value)}
          className="mt-1"
        />
      </div>
    </div>
  );
};

export default DetailedHistory;