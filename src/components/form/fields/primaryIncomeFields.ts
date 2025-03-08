import { FormField } from "@/types/formTypes";

export const PRIMARY_INCOME_FIELDS: FormField[] = [
  { id: "employmentStatus", type: "employmentStatus", label: "primaryEmploymentStatus" },
  { id: "occupation", type: "text", label: "primaryOccupation", placeholder: "Enter primary occupation and duties" },
  { id: "employmentIncome", type: "currency", label: "primaryEmploymentIncome", placeholder: "Enter primary employment income" },
  { id: "selectedInvestments", type: "investmentTypes", label: "primaryInvestmentTypes" },
  { id: "socialSecurityIncome", type: "currency", label: "primarySocialSecurityIncome", placeholder: "Enter primary social security income" },
  { id: "pensionIncome", type: "currency", label: "primaryPensionIncome", placeholder: "Enter primary pension income" },
  { id: "survivorshipIncome", type: "currency", label: "primarySurvivorshipIncome", placeholder: "Enter primary survivorship income" },
  { id: "primaryTotalIncome", type: "currency", label: "primaryTotalIncome", placeholder: "Enter primary total income" },
  { id: "householdExpenses", type: "currency", label: "primaryHouseholdExpenses", placeholder: "Enter primary household expenses" },
];
