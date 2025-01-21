import { FormField } from "@/types/formTypes";

export const PRIMARY_INCOME_FIELDS: FormField[] = [
  { id: "employmentStatus", type: "employmentStatus", label: "Primary Employment Status" },
  { id: "occupation", type: "text", label: "Primary Occupation/Duties", placeholder: "Enter primary occupation and duties" },
  { id: "employmentIncome", type: "currency", label: "Primary Employment Income", placeholder: "Enter primary employment income" },
  { id: "selectedInvestments", type: "investmentTypes", label: "Primary Investment Types" },
  { id: "socialSecurityIncome", type: "currency", label: "Primary Social Security Income", placeholder: "Enter primary social security income" },
  { id: "pensionIncome", type: "currency", label: "Primary Pension Income", placeholder: "Enter primary pension income" },
  { id: "survivorshipIncome", type: "currency", label: "Primary Survivorship Income", placeholder: "Enter primary survivorship income" },
  { id: "totalIncome", type: "currency", label: "Primary Total Income", placeholder: "Enter primary total income" },
  { id: "householdExpenses", type: "currency", label: "Primary Household Expenses", placeholder: "Enter primary household expenses" },
];