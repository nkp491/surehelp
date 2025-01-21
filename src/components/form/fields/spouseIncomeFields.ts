import { FormField } from "@/types/formTypes";

export const SPOUSE_INCOME_FIELDS: FormField[] = [
  { id: "spouseEmploymentStatus", type: "employmentStatus", label: "Spouse Employment Status" },
  { id: "spouseOccupation", type: "text", label: "Spouse Occupation/Duties", placeholder: "Enter spouse occupation and duties" },
  { id: "spouseEmploymentIncome", type: "currency", label: "Spouse Employment Income", placeholder: "Enter spouse employment income" },
  { id: "spouseSelectedInvestments", type: "investmentTypes", label: "Spouse Investment Types" },
  { id: "spouseSocialSecurityIncome", type: "currency", label: "Spouse Social Security Income", placeholder: "Enter spouse social security income" },
  { id: "spousePensionIncome", type: "currency", label: "Spouse Pension Income", placeholder: "Enter spouse pension income" },
  { id: "spouseSurvivorshipIncome", type: "currency", label: "Spouse Survivorship Income", placeholder: "Enter spouse survivorship income" },
  { id: "spouseTotalIncome", type: "currency", label: "Spouse Total Income", placeholder: "Enter spouse total income" },
  { id: "spouseHouseholdExpenses", type: "currency", label: "Spouse Household Expenses", placeholder: "Enter spouse household expenses" },
];