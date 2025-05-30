import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>{t.height}</Label>
        <div className="flex gap-2">
          <Input
            id="height-ft"
            className="w-20 bg-gray-50"
            value={formData.heightFt ?? ""}
            onChange={(e) => handleInputChange("heightFt", e.target.value)}
            placeholder="ft"
          />
          {/* <span className="self-center text-xs">{t.feet}</span> */}
          <Input
            id="height-in"
            className="w-20 bg-gray-50"
            value={formData.heightIn ?? ""}
            onChange={(e) => handleInputChange("heightIn", e.target.value)}
            placeholder="in"
          />
          {/* <span className="self-center text-xs">{t.inches}</span> */}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="weight">{t.weight}</Label>
        <div className="flex gap-2">
          <Input
            id="weight"
            value={formData.weight ?? ""}
            onChange={(e) => handleInputChange("weight", e.target.value)}
            className="bg-gray-50"
            placeholder="Enter weight"
          />
          {/* <span className="self-center text-xs">{t.pounds}</span> */}
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t.tobaccoUse}</Label>
        <RadioGroup
          value={formData.tobaccoUse ?? "no"}
          onValueChange={(value) => handleInputChange("tobaccoUse", value)}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="tobacco-yes" />
            <Label htmlFor="tobacco-yes" className="text-sm">
              {t.yes}
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="tobacco-no" />
            <Label htmlFor="tobacco-no" className="text-sm">
              {t.no}
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label>{t.duiHistory}</Label>
        <RadioGroup
          value={formData.dui ?? "no"}
          onValueChange={(value) => handleInputChange("dui", value)}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="dui-yes" />
            <Label htmlFor="dui-yes" className="text-sm">
              {t.yes}
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="dui-no" />
            <Label htmlFor="dui-no" className="text-sm">
              {t.no}
            </Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
};

export default HealthMetrics;
