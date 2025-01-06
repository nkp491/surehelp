export interface FormValues {
  name: string;
  dob: string;
  age: string;
  height: string;
  weight: string;
  tobaccoUse: string;
  selectedConditions: string[];
  medicalConditions: string;
  hospitalizations: string;
  surgeries: string;
  prescriptionMedications: string;
  lastMedicalExam: string;
  familyMedicalConditions: string;
}

export interface FormField {
  id: string;
  type: string;
  label: string;
  required?: boolean;
  placeholder?: string;
}