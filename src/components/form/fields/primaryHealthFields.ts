import { FormField } from "@/types/formTypes";

export const PRIMARY_HEALTH_FIELDS: FormField[] = [
  { id: "name", type: "text", label: "primaryApplicantName", required: true },
  { id: "dob", type: "date", label: "primaryDateOfBirth", required: true },
  { id: "age", type: "text", label: "primaryAge" },
  { id: "height", type: "height", label: "primaryHeight", placeholder: "Enter primary height" },
  { id: "weight", type: "text", label: "primaryWeight", placeholder: "Enter primary weight" },
  { id: "tobaccoUse", type: "yes_no", label: "primaryTobaccoUse" },
  { id: "dui", type: "yes_no", label: "primaryDUI" },
  { id: "selectedConditions", type: "medicalConditions", label: "primaryMedicalConditions" },
  { id: "medicalConditions", type: "text", label: "primaryOtherMedicalConditions", placeholder: "Enter any other medical conditions" },
  { id: "hospitalizations", type: "text", label: "primaryHospitalizations", placeholder: "Enter any hospitalizations" },
  { id: "surgeries", type: "text", label: "primarySurgeries", placeholder: "Enter any surgeries" },
  { id: "prescriptionMedications", type: "textarea", label: "primaryPrescriptionMedications", placeholder: "Enter prescription medications" },
  { id: "lastMedicalExam", type: "date", label: "primaryLastMedicalExam" },
  { id: "familyMedicalConditions", type: "textarea", label: "primaryFamilyMedicalConditions", placeholder: "Enter family medical conditions" },
];