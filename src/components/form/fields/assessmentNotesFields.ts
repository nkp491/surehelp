import { FormField } from "@/types/formTypes";

export const ASSESSMENT_NOTES_FIELDS: FormField[] = [
  { id: "phone", type: "text", label: "Phone", placeholder: "Enter phone number" },
  { id: "email", type: "text", label: "Email", placeholder: "Enter email address" },
  { id: "address", type: "text", label: "Address", placeholder: "Enter address" },
  { id: "notes", type: "textarea", label: "Notes", placeholder: "Enter general notes" },
  { id: "followUpNotes", type: "textarea", label: "Follow Up Notes", placeholder: "Enter follow up notes" },
  { id: "coverageOptions", type: "textarea", label: "Coverage Options", placeholder: "Enter coverage options" },
  { id: "emergencyContact", type: "text", label: "Emergency Contact", placeholder: "Enter emergency contact" },
  { id: "beneficiaries", type: "textarea", label: "Beneficiary(ies)", placeholder: "Enter beneficiaries" },
];