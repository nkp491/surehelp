export interface FormSubmission {
  // Primary Applicant Fields
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
  
  // Spouse Fields
  spouseName: string;
  spouseDob: string;
  spouseAge: string;
  spouseHeight: string;
  spouseWeight: string;
  spouseTobaccoUse: string;
  spouseSelectedConditions: string[];
  spouseMedicalConditions: string;
  spouseHospitalizations: string;
  spouseSurgeries: string;
  spousePrescriptionMedications: string;
  spouseLastMedicalExam: string;
  spouseFamilyMedicalConditions: string;

  // Shared Fields
  employmentStatus: string[];
  occupation: string;
  selectedInvestments: string[];
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