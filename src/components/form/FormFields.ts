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
  { id: "employmentStatus", type: "employmentStatus", label: "Employment Status" },
  { id: "occupation", type: "text", label: "Occupation/Duties", placeholder: "Enter your occupation and duties" },
  { id: "selectedInvestments", type: "investmentTypes", label: "Investment Types" },
  { id: "socialSecurityIncome", type: "currency", label: "Social Security Income", placeholder: "Enter social security income" },
  { id: "pensionIncome", type: "currency", label: "Pension Income", placeholder: "Enter pension income" },
  { id: "survivorshipIncome", type: "currency", label: "Survivorship Income", placeholder: "Enter survivorship income" },
];

const ASSESSMENT_NOTES_FIELDS: FormField[] = [
  { id: "phone", type: "text", label: "Phone", placeholder: "Enter phone number" },
  { id: "email", type: "text", label: "Email", placeholder: "Enter email address" },
  { id: "address", type: "text", label: "Address", placeholder: "Enter address" },
  { id: "notes", type: "textarea", label: "Notes", placeholder: "Enter general notes" },
  { id: "followUpNotes", type: "textarea", label: "Follow Up Notes", placeholder: "Enter follow up notes" },
  { id: "coverageOptions", type: "textarea", label: "Coverage Options", placeholder: "Enter coverage options" },
  { id: "emergencyContact", type: "text", label: "Emergency Contact", placeholder: "Enter emergency contact" },
  { id: "beneficiaries", type: "textarea", label: "Beneficiary(ies)", placeholder: "Enter beneficiaries" },
];

export const INITIAL_FIELDS = [
  { section: "Health Assessment", fields: HEALTH_FIELDS },
  { section: "Income Assessment", fields: INCOME_FIELDS },
  { section: "Assessment Notes", fields: ASSESSMENT_NOTES_FIELDS },
];