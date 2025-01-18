import { useState, useEffect } from "react";
import { FormSubmission } from "@/types/form";
import { differenceInYears, parse } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

  // Primary Income Fields
  employmentStatus: [],
  occupation: "",
  selectedInvestments: [],
  socialSecurityIncome: "",
  pensionIncome: "",
  survivorshipIncome: "",
  totalIncome: "",
  
  // Spouse Income Fields
  spouseEmploymentStatus: [],
  spouseOccupation: "",
  spouseSelectedInvestments: [],
  spouseSocialSecurityIncome: "",
  spousePensionIncome: "",
  spouseSurvivorshipIncome: "",
  spouseTotalIncome: "",
  
  // Shared/Household Fields
  expenses: "",
  householdExpenses: "",
  lifeInsuranceAmount: "",
  rentOrMortgage: "",
  remainingBalance: "",
  yearsLeft: "",
  homeValue: "",
  equity: "",
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

  const handleSubmit = async (e: React.FormEvent, outcome: string) => {
    e.preventDefault();
    
    if (validateForm()) {
      const submissionData: FormSubmission = {
        ...formData,
        outcome,
        timestamp: editingSubmission?.timestamp || new Date().toISOString()
      };

      try {
        const user = await supabase.auth.getUser();
        if (!user.data.user) throw new Error("No authenticated user found");

        if (editingSubmission) {
          // Update existing submission
          const auditEntry = createAuditEntry(editingSubmission, submissionData, 'updated');
          const auditTrail = [
            ...(editingSubmission.auditTrail || []),
            auditEntry
          ];

          const { error } = await supabase
            .from('submissions')
            .update({
              data: JSON.stringify({
                ...submissionData,
                auditTrail
              }),
              outcome: submissionData.outcome
            })
            .eq('timestamp', editingSubmission.timestamp);

          if (error) throw error;
          
          onUpdate?.(submissionData);
          
          toast({
            title: "Success!",
            description: "Your form has been updated successfully.",
          });
        } else {
          // Create new submission
          const auditEntry = createAuditEntry({}, submissionData, 'created');
          const auditTrail = [auditEntry];

          const { error } = await supabase
            .from('submissions')
            .insert({
              user_id: user.data.user.id,
              data: JSON.stringify({
                ...submissionData,
                auditTrail
              }),
              outcome: submissionData.outcome,
              timestamp: submissionData.timestamp
            });

          if (error) throw error;
          
          toast({
            title: "Success!",
            description: `Form submitted with outcome: ${outcome}`,
          });
        }
        
        setFormData(initialFormValues);
      } catch (error) {
        console.error("Error saving submission:", error);
        toast({
          title: "Error",
          description: "Failed to save submission. Please try again.",
          variant: "destructive",
        });
      }
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