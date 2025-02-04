export type FormTranslations = {
  // Existing keys
  primaryApplicantName: string;
  primaryDateOfBirth: string;
  primaryAge: string;
  primaryHeight: string;
  primaryWeight: string;
  primaryTobaccoUse: string;
  primaryDUI: string;
  primaryMedicalConditions: string;
  primaryOtherMedicalConditions: string;
  primaryHospitalizations: string;
  primarySurgeries: string;
  primaryPrescriptionMedications: string;
  primaryLastMedicalExam: string;
  primaryFamilyMedicalConditions: string;
  primaryEmploymentStatus: string;
  primaryOccupation: string;
  primaryEmploymentIncome: string;
  primaryInvestmentTypes: string;
  primarySocialSecurityIncome: string;
  primaryPensionIncome: string;
  primarySurvivorshipIncome: string;
  primaryTotalIncome: string;
  primaryHouseholdExpenses: string;

  // New keys for form sections
  agentUseOnly: string;
  submitAs: string;
  protected: string;
  followUp: string;
  declined: string;
  addFamilyMember: string;
  primaryHealthAssessment: string;

  // Health assessment fields
  tobaccoUse: string;
  hospitalizations: string;
  surgeries: string;
  prescriptionMedications: string;
  lastMedicalExam: string;
  familyMedicalConditions: string;
  duiHistory: string;
  dateOfBirth: string;
  age: string;
  height: string;
  weight: string;
  fullName: string;

  // Units and measurements
  feet: string;
  inches: string;
  pounds: string;
};

export const formTranslations: Record<'en' | 'es', FormTranslations> = {
  en: {
    // Existing translations
    primaryApplicantName: "Primary Applicant Name",
    primaryDateOfBirth: "Primary Date of Birth",
    primaryAge: "Primary Age",
    primaryHeight: "Height",
    primaryWeight: "Primary Weight",
    primaryTobaccoUse: "Primary Tobacco Use",
    primaryDUI: "Primary DUI History",
    primaryMedicalConditions: "Primary Medical Conditions",
    primaryOtherMedicalConditions: "Primary Other Medical Conditions",
    primaryHospitalizations: "Primary Hospitalizations",
    primarySurgeries: "Primary Surgeries",
    primaryPrescriptionMedications: "Primary Prescription Medications",
    primaryLastMedicalExam: "Primary Last Medical Exam",
    primaryFamilyMedicalConditions: "Primary Family Medical Conditions",
    primaryEmploymentStatus: "Primary Employment Status",
    primaryOccupation: "Primary Occupation/Duties",
    primaryEmploymentIncome: "Primary Employment Income",
    primaryInvestmentTypes: "Investment Types",
    primarySocialSecurityIncome: "Primary Social Security Income",
    primaryPensionIncome: "Primary Pension Income",
    primarySurvivorshipIncome: "Primary Survivorship Income",
    primaryTotalIncome: "Primary Total Income",
    primaryHouseholdExpenses: "Primary Household Expenses",

    // New translations
    agentUseOnly: "Agent Use Only",
    submitAs: "Submit Assessment As",
    protected: "Protected",
    followUp: "Follow Up",
    declined: "Declined",
    addFamilyMember: "Add Family Member",
    primaryHealthAssessment: "Primary Health Assessment",
    
    // Health assessment fields
    tobaccoUse: "Tobacco Use",
    hospitalizations: "Hospitalizations",
    surgeries: "Surgeries",
    prescriptionMedications: "Prescription Medications",
    lastMedicalExam: "Last Medical Exam",
    familyMedicalConditions: "Family Medical Conditions",
    duiHistory: "DUI History",
    dateOfBirth: "Date of Birth",
    age: "Age",
    height: "Height",
    weight: "Weight",
    fullName: "Full Name",

    // Units and measurements
    feet: "ft",
    inches: "in",
    pounds: "lbs",
  },
  es: {
    // Existing translations
    primaryApplicantName: "Nombre del Solicitante Principal",
    primaryDateOfBirth: "Fecha de Nacimiento del Solicitante Principal",
    primaryAge: "Edad del Solicitante Principal",
    primaryHeight: "Altura",
    primaryWeight: "Peso del Solicitante Principal",
    primaryTobaccoUse: "Uso de Tabaco del Solicitante Principal",
    primaryDUI: "Historial de DUI del Solicitante Principal",
    primaryMedicalConditions: "Condiciones Médicas del Solicitante Principal",
    primaryOtherMedicalConditions: "Otras Condiciones Médicas del Solicitante Principal",
    primaryHospitalizations: "Hospitalizaciones del Solicitante Principal",
    primarySurgeries: "Cirugías del Solicitante Principal",
    primaryPrescriptionMedications: "Medicamentos Recetados del Solicitante Principal",
    primaryLastMedicalExam: "Último Examen Médico del Solicitante Principal",
    primaryFamilyMedicalConditions: "Condiciones Médicas Familiares del Solicitante Principal",
    primaryEmploymentStatus: "Estado Laboral del Solicitante Principal",
    primaryOccupation: "Ocupación/Deberes del Solicitante Principal",
    primaryEmploymentIncome: "Ingreso Laboral del Solicitante Principal",
    primaryInvestmentTypes: "Tipos de Inversión",
    primarySocialSecurityIncome: "Ingreso del Seguro Social del Solicitante Principal",
    primaryPensionIncome: "Ingreso de Pensión del Solicitante Principal",
    primarySurvivorshipIncome: "Ingreso de Sobrevivencia del Solicitante Principal",
    primaryTotalIncome: "Ingreso Total del Solicitante Principal",
    primaryHouseholdExpenses: "Gastos del Hogar del Solicitante Principal",

    // New translations
    agentUseOnly: "Solo para Uso del Agente",
    submitAs: "Enviar Evaluación Como",
    protected: "Protegido",
    followUp: "Seguimiento",
    declined: "Rechazado",
    addFamilyMember: "Agregar Miembro Familiar",
    primaryHealthAssessment: "Evaluación de Salud Principal",
    
    // Health assessment fields
    tobaccoUse: "Uso de Tabaco",
    hospitalizations: "Hospitalizaciones",
    surgeries: "Cirugías",
    prescriptionMedications: "Medicamentos Recetados",
    lastMedicalExam: "Último Examen Médico",
    familyMedicalConditions: "Condiciones Médicas Familiares",
    duiHistory: "Historial de DUI",
    dateOfBirth: "Fecha de Nacimiento",
    age: "Edad",
    height: "Altura",
    weight: "Peso",
    fullName: "Nombre Completo",

    // Units and measurements
    feet: "pies",
    inches: "pulg",
    pounds: "libras",
  }
};
