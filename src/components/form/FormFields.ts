import { FormField } from "@/types/formTypes";

const PRIMARY_HEALTH_FIELDS: FormField[] = [
  { id: "name", type: "text", label: "Primary Applicant Name", required: true },
  { id: "dob", type: "date", label: "Primary Date of Birth", required: true },
  { id: "age", type: "text", label: "Primary Age" },
  { id: "height", type: "height", label: "Primary Height", placeholder: "Enter primary height" },
  { id: "weight", type: "text", label: "Primary Weight", placeholder: "Enter primary weight" },
  { id: "tobaccoUse", type: "tobaccoUse", label: "Primary Tobacco Use" },
  { id: "selectedConditions", type: "medicalConditions", label: "Primary Medical Conditions" },
  { id: "medicalConditions", type: "text", label: "Primary Other Medical Conditions", placeholder: "Enter any other medical conditions" },
  { id: "hospitalizations", type: "text", label: "Primary Hospitalizations", placeholder: "Enter any hospitalizations" },
  { id: "surgeries", type: "text", label: "Primary Surgeries", placeholder: "Enter any surgeries" },
  { id: "prescriptionMedications", type: "textarea", label: "Primary Prescription Medications", placeholder: "Enter prescription medications" },
  { id: "lastMedicalExam", type: "date", label: "Primary Last Medical Exam" },
  { id: "familyMedicalConditions", type: "textarea", label: "Primary Family Medical Conditions", placeholder: "Enter family medical conditions" },
];

const SPOUSE_HEALTH_FIELDS: FormField[] = [
  { id: "spouseName", type: "text", label: "Spouse Name" },
  { id: "spouseDob", type: "date", label: "Spouse Date of Birth" },
  { id: "spouseAge", type: "text", label: "Spouse Age" },
  { id: "spouseHeight", type: "height", label: "Spouse Height", placeholder: "Enter spouse height" },
  { id: "spouseWeight", type: "text", label: "Spouse Weight", placeholder: "Enter spouse weight" },
  { id: "spouseTobaccoUse", type: "tobaccoUse", label: "Spouse Tobacco Use" },
  { id: "spouseSelectedConditions", type: "medicalConditions", label: "Spouse Medical Conditions" },
  { id: "spouseMedicalConditions", type: "text", label: "Spouse Other Medical Conditions", placeholder: "Enter any other medical conditions" },
  { id: "spouseHospitalizations", type: "text", label: "Spouse Hospitalizations", placeholder: "Enter any hospitalizations" },
  { id: "spouseSurgeries", type: "text", label: "Spouse Surgeries", placeholder: "Enter any surgeries" },
  { id: "spousePrescriptionMedications", type: "textarea", label: "Spouse Prescription Medications", placeholder: "Enter prescription medications" },
  { id: "spouseLastMedicalExam", type: "date", label: "Spouse Last Medical Exam" },
  { id: "spouseFamilyMedicalConditions", type: "textarea", label: "Spouse Family Medical Conditions", placeholder: "Enter family medical conditions" },
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
  { section: "Primary Health Assessment", fields: PRIMARY_HEALTH_FIELDS },
  { section: "Spouse Health Assessment", fields: SPOUSE_HEALTH_FIELDS },
  { section: "Income Assessment", fields: INCOME_FIELDS },
  { section: "Assessment Notes", fields: ASSESSMENT_NOTES_FIELDS },
  { section: "Agent Use Only", fields: AGENT_USE_ONLY_FIELDS },
];
