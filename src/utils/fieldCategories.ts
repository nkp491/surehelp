export const isAgentField = (fieldId: string): boolean => {
  const agentFields = [
    'sourcedFrom',
    'leadType',
    'premium',
    'effectiveDate',
    'draftDay',
    'coverageAmount',
    'accidental',
    'carrierAndProduct',
    'policyNumber'
  ];
  
  return agentFields.includes(fieldId);
};

export const isSpecialField = (fieldId: string): boolean => {
  return ['height', 'weight', 'tobaccoUse'].includes(fieldId);
};

export const isSpouseField = (fieldId: string): boolean => {
  return fieldId.toLowerCase().startsWith('spouse');
};
