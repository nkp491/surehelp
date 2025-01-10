import { useState, useEffect } from "react";
import { FormSubmission } from "@/types/form";
import { differenceInYears, parse } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

const initialFormValues: Omit<FormSubmission, 'timestamp' | 'outcome'> = {
  // Primary Applicant Fields
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
  
  // Spouse Fields
  spouseName: "",
  spouseDob: "",
  spouseAge: "",
  spouseHeight: "",
  spouseWeight: "",
  spouseTobaccoUse: "no",
  spouseSelectedConditions: [],
  spouseMedicalConditions: "",
  spouseHospitalizations: "",
  spouseSurgeries: "",
  spousePrescriptionMedications: "",
  spouseLastMedicalExam: "",
  spouseFamilyMedicalConditions: "",

  // Shared Fields
  employmentStatus: [],
  occupation: "",
  socialSecurityIncome: "",
  pensionIncome: "",
  survivorshipIncome: "",
  totalIncome: "",
  expenses: "",
  lifeInsuranceAmount: "",
  rentOrMortgage: "",
  remainingBalance: "",
  yearsLeft: "",
  homeValue: "",
  equity: "",
  selectedInvestments: [],
  phone: "",
  email: "",
  address: "",
  notes: "",
  followUpNotes: "",
  coverageOptions: "",
  emergencyContact: "",
  beneficiaries: "",
  sourcedFrom: "",
  leadType: "",
  premium: "",
  effectiveDate: "",
  draftDay: "",
  coverageAmount: "",
  accidental: "",
  carrierAndProduct: "",
  policyNumber: "",
};

export const useFormLogic = (editingSubmission: FormSubmission | null, onUpdate?: (submission: FormSubmission) => void) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<typeof initialFormValues>(initialFormValues);
  const [errors, setErrors] = useState<Partial<typeof initialFormValues>>({});

  useEffect(() => {
    if (editingSubmission) {
      const { timestamp, outcome, ...rest } = editingSubmission;
      setFormData(rest);
    }
  }, [editingSubmission]);

  useEffect(() => {
    // Calculate primary applicant age
    if (formData.dob) {
      const birthDate = parse(formData.dob, 'yyyy-MM-dd', new Date());
      const age = differenceInYears(new Date(), birthDate);
      setFormData(prev => ({ ...prev, age: age.toString() }));
    }

    // Calculate spouse age
    if (formData.spouseDob) {
      const spouseBirthDate = parse(formData.spouseDob, 'yyyy-MM-dd', new Date());
      const spouseAge = differenceInYears(new Date(), spouseBirthDate);
      setFormData(prev => ({ ...prev, spouseAge: spouseAge.toString() }));
    }
  }, [formData.dob, formData.spouseDob]);

  const validateForm = () => {
    const newErrors: Partial<typeof initialFormValues> = {};
    
    if (!formData.name) {
      newErrors.name = "Primary applicant name is required";
    }
    if (!formData.dob) {
      newErrors.dob = "Primary applicant date of birth is required";
    }
    
    // Only validate spouse fields if spouse name is provided
    if (formData.spouseName && !formData.spouseDob) {
      newErrors.spouseDob = "Spouse date of birth is required if adding spouse";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createAuditEntry = (previousData: any, newData: any, action: 'created' | 'updated' | 'status_changed') => {
    const changedFields: string[] = [];
    const previousValues: { [key: string]: any } = {};
    const newValues: { [key: string]: any } = {};

    Object.keys(newData).forEach(key => {
      if (JSON.stringify(previousData[key]) !== JSON.stringify(newData[key])) {
        changedFields.push(key);
        previousValues[key] = previousData[key];
        newValues[key] = newData[key];
      }
    });

    return {
      timestamp: new Date().toISOString(),
      changedFields,
      previousValues,
      newValues,
      action
    };
  };

  const handleSubmit = (e: React.FormEvent, outcome: string) => {
    e.preventDefault();
    
    if (validateForm()) {
      const submissionData: FormSubmission = {
        ...formData,
        outcome,
        timestamp: editingSubmission?.timestamp || new Date().toISOString()
      };

      if (editingSubmission) {
        // Update existing submission
        const auditEntry = createAuditEntry(editingSubmission, submissionData, 'updated');
        submissionData.auditTrail = [
          ...(editingSubmission.auditTrail || []),
          auditEntry
        ];

        const submissions = JSON.parse(localStorage.getItem("formSubmissions") || "[]");
        const updatedSubmissions = submissions.map((s: FormSubmission) => 
          s.timestamp === editingSubmission.timestamp ? submissionData : s
        );
        localStorage.setItem("formSubmissions", JSON.stringify(updatedSubmissions));
        
        onUpdate?.(submissionData);
        
        toast({
          title: "Success!",
          description: "Your form has been updated successfully.",
        });
      } else {
        // Create new submission
        const auditEntry = createAuditEntry({}, submissionData, 'created');
        submissionData.auditTrail = [auditEntry];

        const submissions = JSON.parse(localStorage.getItem("formSubmissions") || "[]");
        submissions.push(submissionData);
        localStorage.setItem("formSubmissions", JSON.stringify(submissions));
        
        toast({
          title: "Success!",
          description: `Form submitted with outcome: ${outcome}`,
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
