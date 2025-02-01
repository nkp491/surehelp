import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations, medicalConditionsTranslations } from "@/utils/translations";
import React from "react";

const medicalConditions = [
  "heart-attack", "heart-failure", "diabetes-pill", "diabetes-insulin",
  "emphysema", "kidney-failure", "terminal-illness", "stroke", "tia",
  "hbp", "asthma", "anxiety", "depression", "hiv-aids", "cardiomyopathy",
  "heart-valve", "cholesterol", "copd", "alzheimers", "parkinsons",
  "lupus", "stent", "bypass", "cancer", "tumors", "thyroid", "dementia", "als"
];

interface PrimaryHealthProps {
  formData: any;
  setFormData: (value: any) => void;
  errors: any;
}

const PrimaryHealth: React.FC<PrimaryHealthProps> = ({ formData, setFormData, errors }) => {
  const { language } = useLanguage();
  const t = translations[language];
  const mc = medicalConditionsTranslations[language];

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="w-[449px]">
      <Button
        variant="link"
        className="flex ml-auto text-[#2a6f97] font-semibold mb-1.5"
      >
        <Plus className="h-4 w-4 mr-1" /> {t.addFamilyMember}
      </Button>

      <Card className="rounded-[12px]">
        <CardHeader className="bg-[#0096c7] rounded-t-[12px] py-2 px-3.5">
          <h1 className="text-white font-bold text-base">
            {t.primaryHealthAssessment}
          </h1>
        </CardHeader>

        <CardContent className="p-4 space-y-6">
          <div className="space-y-4">
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

            <div className="space-y-2">
              <Label>{t.medicalCondition}</Label>
              <div className="grid grid-cols-3 gap-2">
                {medicalConditions.map((condition) => (
                  <div
                    key={condition}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox 
                      id={condition}
                      checked={(formData.selectedConditions || []).includes(condition)}
                      onCheckedChange={(checked) => {
                        const currentConditions = formData.selectedConditions || [];
                        const newConditions = checked
                          ? [...currentConditions, condition]
                          : currentConditions.filter((id: string) => id !== condition);
                        handleInputChange('selectedConditions', newConditions);
                      }}
                    />
                    <Label htmlFor={condition} className="text-xs">
                      {mc[condition]}
                    </Label>
                  </div>
                ))}
                <div className="flex items-center space-x-2">
                  <Checkbox id="other" />
                  <Label htmlFor="other" className="text-xs">
                    {t.other}:
                  </Label>
                  <Input 
                    className="h-6"
                    value={formData.otherConditions || ''}
                    onChange={(e) => handleInputChange('otherConditions', e.target.value)}
                  />
                </div>
              </div>
            </div>

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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrimaryHealth;