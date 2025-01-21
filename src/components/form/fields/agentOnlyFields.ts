import { FormField } from "@/types/formTypes";

export const AGENT_USE_ONLY_FIELDS: FormField[] = [
  { id: "sourcedFrom", type: "text", label: "Sourced From", placeholder: "Enter source" },
  { 
    id: "leadType", 
    type: "select", 
    label: "Lead Type", 
    placeholder: "Select lead type",
    options: [
      "Mortgage Protection",
      "Internet/Facebook",
      "Live Transfer",
      "Referral",
      "Other"
    ]
  },
  { id: "premium", type: "text", label: "Premium", placeholder: "Enter premium" },
  { id: "effectiveDate", type: "date", label: "Effective Date" },
  { id: "draftDay", type: "date", label: "Draft Day" },
  { id: "coverageAmount", type: "currency", label: "Coverage Amount", placeholder: "Enter coverage amount" },
  { id: "accidental", type: "text", label: "Accidental", placeholder: "Enter accidental details" },
  { id: "carrierAndProduct", type: "text", label: "Carrier & Product", placeholder: "Enter carrier and product" },
  { id: "policyNumber", type: "text", label: "Policy Number", placeholder: "Enter policy number" },
];