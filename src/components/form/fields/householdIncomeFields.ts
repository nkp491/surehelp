import { FormField } from "@/types/formTypes";

export const HOUSEHOLD_INCOME_FIELDS: FormField[] = [
  { id: "lifeInsuranceAmount", type: "currency", label: "Life Insurance Amount", placeholder: "Enter life insurance amount" },
  { id: "rentOrMortgage", type: "currency", label: "Rent or Mortgage", placeholder: "Enter rent or mortgage amount" },
  { id: "remainingBalance", type: "currency", label: "Remaining Balance", placeholder: "Enter remaining balance" },
  { id: "yearsLeft", type: "text", label: "Years Left", placeholder: "Enter years left" },
  { id: "homeValue", type: "currency", label: "Home Value", placeholder: "Enter home value" },
  { id: "equity", type: "text", label: "Equity", placeholder: "Enter equity" },
  { id: "expenses", type: "currency", label: "Other Expenses", placeholder: "Enter other expenses" },
];