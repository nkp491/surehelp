export interface FormSubmission {
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
  employmentStatus: string[];
  occupation: string;
  socialSecurityIncome: string;
  pensionIncome: string;
  survivorshipIncome: string;
  totalIncome: string;
  expenses: string;
  lifeInsuranceAmount: string;
  rentOrMortgage: string;
  remainingBalance: string;
  yearsLeft: string;
  homeValue: string;
  equity: string;
  selectedInvestments: string[];
  phone: string;
  email: string;
  address: string;
  notes: string;
  followUpNotes: string;
  coverageOptions: string;
  emergencyContact: string;
  beneficiaries: string;
  sourcedFrom: string;
  leadType: string;
  premium: string;
  effectiveDate: string;
  draftDay: string;
  coverageAmount: string;
  accidental: string;
  carrierAndProduct: string;
  policyNumber: string;
  timestamp: string;
  outcome: string;
  auditTrail?: AuditEntry[];
}

export interface AuditEntry {
  timestamp: string;
  changedFields: string[];
  previousValues: { [key: string]: any };
  newValues: { [key: string]: any };
  action: 'created' | 'updated' | 'status_changed';
}