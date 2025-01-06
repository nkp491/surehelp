import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import FormField from "./FormField";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { differenceInYears, parse } from "date-fns";
import MedicalConditionsCheckbox from "./MedicalConditionsCheckbox";

interface FormData {
  name: string;
  dob: string;
  age: string;
  height: string;
  weight: string;
  tobaccoUse: string;
  selectedConditions: string[];
  medicalConditions: string;
  hospitalizations: string;
  surgeries: string;
  prescriptionMedications: string;
  lastMedicalExam: string;
  familyMedicalConditions: string;
  timestamp?: string;
}

interface FormContainerProps {
  editingSubmission: FormData | null;
  onUpdate?: (submission: FormData) => void;
}

const FormContainer = ({ editingSubmission, onUpdate }: FormContainerProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    dob: "",
    age: "",
    height: "",
    weight: "",
    tobaccoUse: "no",
    selectedConditions: [],
    medicalConditions: "",
    hospitalizations: "",
    surgeries: "",
    prescriptionMedications: "",
    lastMedicalExam: "",
    familyMedicalConditions: "",
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});

  useEffect(() => {
    if (editingSubmission) {
      setFormData(editingSubmission);
    }
  }, [editingSubmission]);

  useEffect(() => {
    if (formData.dob) {
      const birthDate = parse(formData.dob, 'yyyy-MM-dd', new Date());
      const age = differenceInYears(new Date(), birthDate);
      setFormData(prev => ({ ...prev, age: age.toString() }));
    }
  }, [formData.dob]);

  const validateForm = () => {
    const newErrors: Partial<FormData> = {};
    
    if (!formData.name) {
      newErrors.name = "Name is required";
    }
    if (!formData.dob) {
      newErrors.dob = "Date of Birth is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      if (editingSubmission) {
        onUpdate?.({
          ...formData,
          timestamp: editingSubmission.timestamp
        });
        
        toast({
          title: "Success!",
          description: "Your form has been updated successfully.",
        });
      } else {
        const submissions = JSON.parse(localStorage.getItem("formSubmissions") || "[]");
        const newSubmission = { ...formData, timestamp: new Date().toISOString() };
        submissions.push(newSubmission);
        localStorage.setItem("formSubmissions", JSON.stringify(submissions));
        
        toast({
          title: "Success!",
          description: "Your form has been submitted successfully.",
        });
      }
      
      setFormData({
        name: "",
        dob: "",
        age: "",
        height: "",
        weight: "",
        tobaccoUse: "no",
        selectedConditions: [],
        medicalConditions: "",
        hospitalizations: "",
        surgeries: "",
        prescriptionMedications: "",
        lastMedicalExam: "",
        familyMedicalConditions: "",
      });
    } else {
      toast({
        title: "Error",
        description: "Please check the form for errors.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto p-6">
      <FormField
        label="Name"
        type="text"
        value={formData.name}
        onChange={(value) => setFormData({ ...formData, name: value })}
        placeholder="Enter your name"
        required
        error={errors.name}
      />
      
      <FormField
        label="Date of Birth"
        type="date"
        value={formData.dob}
        onChange={(value) => setFormData({ ...formData, dob: value })}
        required
        error={errors.dob}
      />
      
      <FormField
        label="Age"
        type="text"
        value={formData.age}
        readOnly
        placeholder="Auto-calculated from DOB"
      />
      
      <FormField
        label="Height"
        type="text"
        value={formData.height}
        onChange={(value) => setFormData({ ...formData, height: value })}
        placeholder="Enter your height"
      />
      
      <FormField
        label="Weight"
        type="text"
        value={formData.weight}
        onChange={(value) => setFormData({ ...formData, weight: value })}
        placeholder="Enter your weight"
      />
      
      <div className="space-y-2">
        <Label>Tobacco Use</Label>
        <RadioGroup
          value={formData.tobaccoUse}
          onValueChange={(value) => setFormData({ ...formData, tobaccoUse: value })}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="yes" />
            <Label htmlFor="yes">Yes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="no" />
            <Label htmlFor="no">No</Label>
          </div>
        </RadioGroup>
      </div>

      <MedicalConditionsCheckbox
        selectedConditions={formData.selectedConditions}
        onChange={(conditions) => setFormData({ ...formData, selectedConditions: conditions })}
      />
      
      <FormField
        label="Other Medical Conditions"
        type="text"
        value={formData.medicalConditions}
        onChange={(value) => setFormData({ ...formData, medicalConditions: value })}
        placeholder="Enter any other medical conditions"
      />
      
      <FormField
        label="Hospitalizations"
        type="text"
        value={formData.hospitalizations}
        onChange={(value) => setFormData({ ...formData, hospitalizations: value })}
        placeholder="Enter any hospitalizations"
      />
      
      <FormField
        label="Surgeries"
        type="text"
        value={formData.surgeries}
        onChange={(value) => setFormData({ ...formData, surgeries: value })}
        placeholder="Enter any surgeries"
      />
      
      <FormField
        label="Prescription Medications"
        type="textarea"
        value={formData.prescriptionMedications}
        onChange={(value) => setFormData({ ...formData, prescriptionMedications: value })}
        placeholder="Enter your prescription medications"
      />
      
      <FormField
        label="Last Medical Exam"
        type="date"
        value={formData.lastMedicalExam}
        onChange={(value) => setFormData({ ...formData, lastMedicalExam: value })}
      />
      
      <FormField
        label="Family Medical Conditions"
        type="textarea"
        value={formData.familyMedicalConditions}
        onChange={(value) => setFormData({ ...formData, familyMedicalConditions: value })}
        placeholder="Enter family medical conditions"
      />
      
      <Button type="submit" className="w-full">
        {editingSubmission ? "Update Form" : "Submit Form"}
      </Button>
    </form>
  );
};

export default FormContainer;