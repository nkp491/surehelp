import { FormField } from "@/types/formTypes";

const HEALTH_FIELDS: FormField[] = [
  { id: "name", type: "text", label: "Name", required: true },
  { id: "dob", type: "date", label: "Date of Birth", required: true },
  { id: "age", type: "text", label: "Age" },
  { id: "height", type: "height", label: "Height", placeholder: "Enter your height" },
  { id: "weight", type: "text", label: "Weight", placeholder: "Enter your weight" },
  { id: "tobaccoUse", type: "tobaccoUse", label: "Tobacco Use" },
  { id: "selectedConditions", type: "medicalConditions", label: "Medical Conditions" },
  { id: "medicalConditions", type: "text", label: "Other Medical Conditions", placeholder: "Enter any other medical conditions" },
  { id: "hospitalizations", type: "text", label: "Hospitalizations", placeholder: "Enter any hospitalizations" },
  { id: "surgeries", type: "text", label: "Surgeries", placeholder: "Enter any surgeries" },
  { id: "prescriptionMedications", type: "textarea", label: "Prescription Medications", placeholder: "Enter your prescription medications" },
  { id: "lastMedicalExam", type: "date", label: "Last Medical Exam" },
  { id: "familyMedicalConditions", type: "textarea", label: "Family Medical Conditions", placeholder: "Enter family medical conditions" },
];

const INCOME_FIELDS: FormField[] = [
  { id: "occupation", type: "text", label: "Occupation/Duties", placeholder: "Enter your occupation and duties" },
  { id: "socialSecurityIncome", type: "currency", label: "Social Security Income", placeholder: "Enter social security income" },
  { id: "pensionIncome", type: "currency", label: "Pension Income", placeholder: "Enter pension income" },
  { id: "survivorshipIncome", type: "currency", label: "Survivorship Income", placeholder: "Enter survivorship income" },
];

export const INITIAL_FIELDS = [
  { section: "Health Assessment", fields: HEALTH_FIELDS },
  { section: "Income Assessment", fields: INCOME_FIELDS },
];