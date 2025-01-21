import { useState, useEffect } from "react";
import { FormSubmission } from "@/types/form";

const initialFormValues: Omit<FormSubmission, 'timestamp' | 'outcome'> = {
  // Primary Applicant Fields
  name: "",
  dob: "",
  age: "",
  height: "",
  weight: "",
  tobaccoUse: "no",
  dui: "None",
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
  spouseDui: "None",
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
  
  // Contact Information
  phone: "",
  email: "",
  address: "",
  
  // Assessment Notes
  notes: "",
  followUpNotes: "",
  coverageOptions: "",
  emergencyContact: "",
  beneficiaries: "",
  sourcedFrom: "",
  
  // Financial Information
  expenses: "",
  householdExpenses: "",
  lifeInsuranceAmount: "",
  rentOrMortgage: "",
  remainingBalance: "",
  yearsLeft: "",
  homeValue: "",
  equity: "",
  
  // Policy Information
  coverageAmount: "",
  premium: "",
  carrierAndProduct: "",
  policyNumber: "",
  leadType: "",
  effectiveDate: "",
  draftDay: "",
  accidental: "",
};

export const useFormState = (editingSubmission: FormSubmission | null) => {
  const [formData, setFormData] = useState<typeof initialFormValues>(initialFormValues);
  const [errors, setErrors] = useState<Partial<typeof initialFormValues>>({});

  useEffect(() => {
    if (editingSubmission) {
      const { timestamp, outcome, ...submissionData } = editingSubmission;
      setFormData(submissionData);
    }
  }, [editingSubmission]);

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    initialFormValues,
  };
};