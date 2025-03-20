
/**
 * Format a number with thousands separators
 */
export const formatNumber = (value: number | undefined): string => {
  if (value === undefined) return '0';
  
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0
  }).format(value);
};

/**
 * Format a currency value
 */
export const formatCurrency = (value: number | undefined): string => {
  if (value === undefined) return '$0';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};
