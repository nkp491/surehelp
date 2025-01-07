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
  { id: "totalIncome", type: "currency", label: "Total Income", placeholder: "Enter total income" },
  { id: "expenses", type: "currency", label: "Expenses", placeholder: "Enter expenses" },
  { id: "lifeInsuranceAmount", type: "currency", label: "Life Insurance Amount", placeholder: "Enter life insurance amount" },
  { id: "rentOrMortgage", type: "currency", label: "Rent or Mortgage", placeholder: "Enter rent or mortgage amount" },
  { id: "remainingBalance", type: "currency", label: "Remaining Balance", placeholder: "Enter remaining balance" },
  { id: "yearsLeft", type: "text", label: "Years Left", placeholder: "Enter years left" },
  { id: "homeValue", type: "currency", label: "Home Value", placeholder: "Enter home value" },
  { id: "equity", type: "text", label: "Equity", placeholder: "Enter equity" },
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

const AGENT_USE_ONLY_FIELDS: FormField[] = [
  { id: "sourcedFrom", type: "text", label: "Sourced From", placeholder: "Enter source" },
  { id: "leadType", type: "text", label: "Lead Type", placeholder: "Enter lead type" },
  { id: "premium", type: "text", label: "Premium", placeholder: "Enter premium" },
  { id: "effectiveDate", type: "date", label: "Effective Date" },
  { id: "draftDay", type: "date", label: "Draft Day" },
  { id: "coverageAmount", type: "currency", label: "Coverage Amount", placeholder: "Enter coverage amount" },
  { id: "accidental", type: "text", label: "Accidental", placeholder: "Enter accidental details" },
  { id: "carrierAndProduct", type: "text", label: "Carrier & Product", placeholder: "Enter carrier and product" },
  { id: "policyNumber", type: "text", label: "Policy Number", placeholder: "Enter policy number" },
];

export const INITIAL_FIELDS = [
  { section: "Health Assessment", fields: HEALTH_FIELDS },
  { section: "Income Assessment", fields: INCOME_FIELDS },
  { section: "Assessment Notes", fields: ASSESSMENT_NOTES_FIELDS },
  { section: "Agent Use Only", fields: AGENT_USE_ONLY_FIELDS },
];