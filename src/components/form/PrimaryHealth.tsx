
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/translations";
import PersonalInfo from "./health/PersonalInfo";
import HealthMetrics from "./health/HealthMetrics";
import HealthHistory from "./health/HealthHistory";
import MedicalConditions from "./health/MedicalConditions";
import DetailedHistory from "./health/DetailedHistory";
import { Separator } from "@/components/ui/separator";

interface PrimaryHealthProps {
  formData: any;
  setFormData: (value: any) => void;
  errors: any;
}

const PrimaryHealth = ({ formData, setFormData, errors }: PrimaryHealthProps) => {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="space-y-4">
      <Card className="rounded-[12px]">
        <CardHeader className="bg-[#0096c7] rounded-t-[12px] py-1 px-3">
          <h1 className="text-white font-medium text-sm">
            {t.primaryHealthAssessment}
          </h1>
        </CardHeader>

        <CardContent className="p-4 space-y-6">
          <div className="space-y-4">
            <PersonalInfo formData={formData} setFormData={setFormData} />
            <HealthMetrics formData={formData} setFormData={setFormData} />
            <HealthHistory formData={formData} setFormData={setFormData} />
            <MedicalConditions formData={formData} setFormData={setFormData} />
            <DetailedHistory formData={formData} setFormData={setFormData} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrimaryHealth;

