export const isHealthField = (fieldId: string): boolean => {
  const healthFields = [
    'height', 'weight', 'tobaccoUse', 'dui', 'selectedConditions', 
    'medicalConditions', 'hospitalizations', 'surgeries', 
    'prescriptionMedications', 'lastMedicalExam', 'familyMedicalConditions', 
    'spouseHeight', 'spouseWeight', 'spouseTobaccoUse', 'spouseDui', 
    'spouseSelectedConditions', 'spouseMedicalConditions'
  ];
  return healthFields.some(field => fieldId.includes(field));
};

export const isIncomeField = (fieldId: string): boolean => {
  const incomeFields = [
    'employmentStatus', 'occupation', 'employmentIncome', 'selectedInvestments',
    'socialSecurityIncome', 'pensionIncome', 'survivorshipIncome', 'totalIncome',
    'householdExpenses', 'spouseEmploymentStatus', 'spouseOccupation', 
    'spouseEmploymentIncome', 'spouseSelectedInvestments'
  ];
  return incomeFields.some(field => fieldId.includes(field));
};

export const isAgentField = (fieldId: string): boolean => {
  const agentFields = [
    'sourcedFrom', 'leadType', 'premium', 'effectiveDate', 'draftDay',
    'coverageAmount', 'accidental', 'carrierAndProduct', 'policyNumber'
  ];
  return agentFields.includes(fieldId);
};