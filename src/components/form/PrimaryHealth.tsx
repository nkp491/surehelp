import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import React from "react";

interface PrimaryHealthProps {
  formData: any;
  setFormData: (value: any) => void;
  errors: any;
}

const medicalConditions = [
  { id: "heart-attack", label: "Heart Attack" },
  { id: "heart-failure", label: "Heart Failure" },
  { id: "diabetes-pill", label: "Diabetes: Pill" },
  { id: "diabetes-insulin", label: "Diabetes: Insulin" },
  { id: "emphysema", label: "Emphysema" },
  { id: "kidney-failure", label: "Kidney Failure" },
  { id: "terminal-illness", label: "Terminal Illness" },
  { id: "stroke", label: "Stroke" },
  { id: "tia", label: "TIA" },
  { id: "hbp", label: "HBP" },
  { id: "asthma", label: "Asthma" },
  { id: "anxiety", label: "Anxiety" },
  { id: "depression", label: "Depression" },
  { id: "hiv-aids", label: "HIV/AIDs" },
  { id: "cardiomyopathy", label: "Cardiomyopathy" },
  { id: "heart-valve", label: "Heart Valve" },
  { id: "cholesterol", label: "Cholesterol" },
  { id: "copd", label: "COPD" },
  { id: "alzheimers", label: "Alzheimer's" },
  { id: "parkinsons", label: "Parkinson's" },
  { id: "lupus", label: "Lupus" },
  { id: "stent", label: "Stent" },
  { id: "bypass", label: "Bypass" },
  { id: "cancer", label: "Cancer" },
  { id: "tumors", label: "Tumors" },
  { id: "thyroid", label: "Thyroid" },
  { id: "dementia", label: "Dementia" },
  { id: "als", label: "ALS" },
];

const PrimaryHealth: React.FC<PrimaryHealthProps> = ({ formData, setFormData, errors }) => {
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const [feet, inches] = (formData.height || "0'0\"").split("'").map((v: string) => v.replace('"', ''));

  return (
    <div className="w-full max-w-[449px]">
      <Button
        variant="link"
        className="flex ml-auto text-[#2a6f97] font-semibold mb-1.5"
      >
        <Plus className="h-4 w-4 mr-1" /> Add Family Member
      </Button>

      <Card className="rounded-[12px]">
        <CardHeader className="bg-[#0096c7] rounded-t-[12px] py-2 px-3.5">
          <h1 className="text-white font-bold text-base">
            Primary Health Assessment
          </h1>
        </CardHeader>

        <CardContent className="p-4 space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input 
                  id="name" 
                  value={formData.name || ''} 
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
                {errors.name && <span className="text-red-500 text-sm">{errors.name}</span>}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dob">
                  Date of Birth <span className="text-red-500">*</span>
                </Label>
                <Input 
                  id="dob" 
                  type="date"
                  value={formData.dob || ''} 
                  onChange={(e) => handleInputChange('dob', e.target.value)}
                />
                {errors.dob && <span className="text-red-500 text-sm">{errors.dob}</span>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input 
                  id="age" 
                  value={formData.age || ''} 
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height</Label>
                <div className="flex gap-2">
                  <Input 
                    id="height-ft" 
                    className="w-16"
                    value={feet}
                    onChange={(e) => {
                      const newFeet = e.target.value;
                      handleInputChange('height', `${newFeet}'${inches}"`);
                    }}
                  />
                  <span className="self-center text-xs">ft.</span>
                  <Input 
                    id="height-in" 
                    className="w-16"
                    value={inches}
                    onChange={(e) => {
                      const newInches = e.target.value;
                      handleInputChange('height', `${feet}'${newInches}"`);
                    }}
                  />
                  <span className="self-center text-xs">in.</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight</Label>
                <div className="flex gap-2">
                  <Input 
                    id="weight"
                    value={formData.weight || ''} 
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                  />
                  <span className="self-center text-xs">lb.</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tobacco Use</Label>
                <RadioGroup 
                  value={formData.tobaccoUse || 'no'} 
                  onValueChange={(value) => handleInputChange('tobaccoUse', value)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="tobacco-yes" />
                    <Label htmlFor="tobacco-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="tobacco-no" />
                    <Label htmlFor="tobacco-no">No</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label>DUI History</Label>
                <Input 
                  value={formData.dui || ''} 
                  onChange={(e) => handleInputChange('dui', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Medical Condition</Label>
              <div className="grid grid-cols-3 gap-2">
                {medicalConditions.map((condition) => (
                  <div
                    key={condition.id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox 
                      id={condition.id}
                      checked={(formData.selectedConditions || []).includes(condition.id)}
                      onCheckedChange={(checked) => {
                        const currentConditions = formData.selectedConditions || [];
                        const newConditions = checked
                          ? [...currentConditions, condition.id]
                          : currentConditions.filter((id: string) => id !== condition.id);
                        handleInputChange('selectedConditions', newConditions);
                      }}
                    />
                    <Label htmlFor={condition.id} className="text-xs">
                      {condition.label}
                    </Label>
                  </div>
                ))}
                <div className="flex items-center space-x-2">
                  <Checkbox id="other" />
                  <Label htmlFor="other" className="text-xs">
                    Other:
                  </Label>
                  <Input 
                    className="h-6"
                    value={formData.medicalConditions || ''} 
                    onChange={(e) => handleInputChange('medicalConditions', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Hospitalizations</Label>
                <Textarea 
                  className="min-h-[100px]"
                  value={formData.hospitalizations || ''} 
                  onChange={(e) => handleInputChange('hospitalizations', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Surgeries</Label>
                <Textarea 
                  className="min-h-[100px]"
                  value={formData.surgeries || ''} 
                  onChange={(e) => handleInputChange('surgeries', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Prescription Medications</Label>
                <Textarea 
                  className="min-h-[100px]"
                  value={formData.prescriptionMedications || ''} 
                  onChange={(e) => handleInputChange('prescriptionMedications', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Last Medical Exam</Label>
                <Input 
                  type="date"
                  value={formData.lastMedicalExam || ''} 
                  onChange={(e) => handleInputChange('lastMedicalExam', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Family Medical Conditions</Label>
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