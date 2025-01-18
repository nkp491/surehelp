import { useState } from "react";
import { FormSubmission } from "@/types/form";

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

export const useFormState = (editingSubmission: FormSubmission | null) => {
  const [formData, setFormData] = useState<typeof initialFormValues>(initialFormValues);
  const [errors, setErrors] = useState<Partial<typeof initialFormValues>>({});

  // Load editing submission data
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