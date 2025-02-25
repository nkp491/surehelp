
import { FormField } from "@/types/formTypes";

export const ASSESSMENT_NOTES_FIELDS: FormField[] = [
  // Contact Information Group
  { 
    id: "phone", 
    type: "text", 
    label: "Phone", 
    placeholder: "Enter phone number",
    labelClassName: "mb-2 mt-4"
  },
  { 
    id: "email", 
    type: "text", 
    label: "Email", 
    placeholder: "Enter email address",
    labelClassName: "mb-2 mt-4"
  },
  { 
    id: "address", 
    type: "text", 
    label: "Address", 
    placeholder: "Enter address",
    labelClassName: "mb-2 mt-4"
  },
  { 
    id: "emergencyContact", 
    type: "text", 
    label: "Emergency Contact", 
    placeholder: "Enter emergency contact",
    labelClassName: "mb-2 mt-4"
  },
  
  // Notes Group
  { 
    id: "notes", 
    type: "textarea", 
    label: "Notes", 
    placeholder: "Enter general notes",
    labelClassName: "mb-2 mt-4"
  },
  { 
    id: "followUpNotes", 
    type: "textarea", 
    label: "Follow Up Notes", 
    placeholder: "Enter follow up notes",
    labelClassName: "mb-2 mt-4"
  },
  { 
    id: "coverageOptions", 
    type: "textarea", 
    label: "Coverage Options", 
    placeholder: "Enter coverage options",
    labelClassName: "mb-2 mt-4"
  },
  { 
    id: "beneficiaries", 
    type: "textarea", 
    label: "Beneficiary(ies)", 
    placeholder: "Enter beneficiaries",
    labelClassName: "mb-2 mt-4"
  },

  // Agent Use Only Fields
  { 
    id: "sourcedFrom", 
    type: "text", 
    label: "Sourced From", 
    placeholder: "Enter source",
    labelClassName: "mb-2 mt-4"
  },
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
    ],
    labelClassName: "mb-2 mt-4"
  },
  { 
    id: "premium", 
    type: "currency", 
    label: "Premium", 
    placeholder: "Enter premium",
    labelClassName: "mb-2 mt-4"
  },
  { 
    id: "effectiveDate", 
    type: "date", 
    label: "Effective Date",
    labelClassName: "mb-2 mt-4"
  },
  { 
    id: "draftDay", 
    type: "text", 
    label: "Draft Day", 
    placeholder: "Enter draft day",
    labelClassName: "mb-2 mt-4"
  },
  { 
    id: "coverageAmount", 
    type: "currency", 
    label: "Coverage Amount", 
    placeholder: "Enter coverage amount",
    labelClassName: "mb-2 mt-4"
  },
  { 
    id: "accidental", 
    type: "text", 
    label: "Accidental", 
    placeholder: "Enter accidental",
    labelClassName: "mb-2 mt-4"
  },
  { 
    id: "carrierAndProduct", 
    type: "text", 
    label: "Carrier & Product", 
    placeholder: "Enter carrier and product",
    labelClassName: "mb-2 mt-4"
  },
  { 
    id: "policyNumber", 
    type: "text", 
    label: "Policy Number", 
    placeholder: "Enter policy number",
    labelClassName: "mb-2 mt-4"
  }
];
