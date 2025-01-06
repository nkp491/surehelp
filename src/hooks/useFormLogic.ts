import { useState, useEffect } from "react";
import { FormValues } from "@/types/formTypes";
import { FormSubmission } from "@/types/form";
import { differenceInYears, parse } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

const initialFormValues: FormValues = {
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
};

export const useFormLogic = (editingSubmission: FormSubmission | null, onUpdate?: (submission: FormSubmission) => void) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormValues>(initialFormValues);
  const [errors, setErrors] = useState<Partial<FormValues>>({});

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
    const newErrors: Partial<FormValues> = {};
    
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
      
      setFormData(initialFormValues);
    } else {
      toast({
        title: "Error",
        description: "Please check the form for errors.",
        variant: "destructive",
      });
    }
  };

  return {
    formData,
    setFormData,
    errors,
    handleSubmit,
  };
};