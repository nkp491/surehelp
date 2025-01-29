import { FormField } from "@/types/formTypes";

export const ASSESSMENT_NOTES_FIELDS: FormField[] = [
  // Contact Information Group
  { id: "phone", type: "text", label: "Phone", placeholder: "Enter phone number" },
  { id: "email", type: "text", label: "Email", placeholder: "Enter email address" },
  { id: "address", type: "text", label: "Address", placeholder: "Enter address" },
  { id: "emergencyContact", type: "text", label: "Emergency Contact", placeholder: "Enter emergency contact" },
  
  // Notes Group
  { id: "notes", type: "textarea", label: "Notes", placeholder: "Enter general notes" },
  { id: "followUpNotes", type: "textarea", label: "Follow Up Notes", placeholder: "Enter follow up notes" },
  { id: "coverageOptions", type: "textarea", label: "Coverage Options", placeholder: "Enter coverage options" },
  { id: "beneficiaries", type: "textarea", label: "Beneficiary(ies)", placeholder: "Enter beneficiaries" },

  // Agent Use Only Fields
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
  { id: "premium", type: "text", label: "Premium", placeholder: "Enter premium" },
  { id: "effectiveDate", type: "date", label: "Effective Date" },
  { id: "draftDay", type: "text", label: "Draft Day", placeholder: "Enter draft day" },
  { id: "coverageAmount", type: "text", label: "Coverage Amount", placeholder: "Enter coverage amount" },
  { id: "accidental", type: "text", label: "Accidental", placeholder: "Enter accidental" },
  { id: "carrierAndProduct", type: "text", label: "Carrier & Product", placeholder: "Enter carrier and product" },
  { id: "policyNumber", type: "text", label: "Policy Number", placeholder: "Enter policy number" }
];