import { FormField } from "@/types/formTypes";

export const AGENT_FIELDS: FormField[] = [
  { id: "sourcedFrom", type: "text", label: "Sourced From", placeholder: "Enter source" },
  { 
    id: "leadType", 
    type: "select", 
    label: "Lead Type",
    options: [
      "Mortgage Protection",
      "Internet/Facebook",
      "Live Transfer",
      "Referral",
      "Other"
    ]
  },
  { id: "premium", type: "currency", label: "Premium", placeholder: "Enter premium" },
  { id: "effectiveDate", type: "date", label: "Effective Date" },
  { id: "draftDay", type: "text", label: "Draft Day", placeholder: "Enter draft day" },
  { id: "coverageAmount", type: "currency", label: "Coverage Amount", placeholder: "Enter coverage amount" },
  { id: "carrierAndProduct", type: "text", label: "Carrier & Product", placeholder: "Enter carrier and product" },
  { id: "policyNumber", type: "text", label: "Policy Number", placeholder: "Enter policy number" }
];