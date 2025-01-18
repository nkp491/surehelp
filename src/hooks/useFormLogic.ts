import { useState, useEffect } from "react";
import { FormSubmission } from "@/types/form";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAgeCalculation } from "./useAgeCalculation";
import { useIncomeCalculation } from "./useIncomeCalculation";
import { useFormValidation } from "./useFormValidation";
import { useAuditTrail } from "./useAuditTrail";

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
  employmentIncome: "",
  selectedInvestments: [],
  socialSecurityIncome: "",
  pensionIncome: "",
  survivorshipIncome: "",
  totalIncome: "",
  
  // Spouse Income Fields
  spouseEmploymentStatus: [],
  spouseOccupation: "",
  spouseEmploymentIncome: "",
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

export const useFormLogic = (
  editingSubmission: FormSubmission | null,
  onUpdate?: (submission: FormSubmission) => void
) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<typeof initialFormValues>(initialFormValues);
  const [errors, setErrors] = useState<Partial<typeof initialFormValues>>({});

  const { age, spouseAge } = useAgeCalculation(formData.dob, formData.spouseDob);
  const { totalIncome, spouseTotalIncome } = useIncomeCalculation(formData);
  const { validateForm } = useFormValidation();
  const { createAuditEntry } = useAuditTrail();

  // Update ages and incomes in form data when calculated
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      age,
      spouseAge,
      totalIncome,
      spouseTotalIncome
    }));
  }, [age, spouseAge, totalIncome, spouseTotalIncome]);

  // Load editing submission data
  useEffect(() => {
    if (editingSubmission) {
      const { timestamp, outcome, ...submissionData } = editingSubmission;
      setFormData(submissionData);
    }
  }, [editingSubmission]);

  const handleSubmit = async (e: React.FormEvent, outcome: string) => {
    e.preventDefault();
    
    const validationErrors = validateForm(formData);
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length === 0) {
      const submissionData = {
        ...formData,
        outcome,
        timestamp: editingSubmission?.timestamp || new Date().toISOString()
      };

      try {
        const user = await supabase.auth.getUser();
        if (!user.data.user) throw new Error("No authenticated user found");

        if (editingSubmission) {
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
