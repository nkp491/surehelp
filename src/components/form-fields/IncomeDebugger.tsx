import { useEffect } from 'react';

interface IncomeDebuggerProps {
  formData: any;
}

/**
 * This component doesn't render anything visible.
 * It just logs detailed information about income fields to help debug calculation issues.
 */
const IncomeDebugger: React.FC<IncomeDebuggerProps> = ({ formData }) => {
  useEffect(() => {
    // Helper function to clean and parse values
    const cleanAndParse = (value: string): number => {
      if (!value) return 0;
      // Remove any non-numeric characters except decimal point
      const cleanValue = value.replace(/[^\d.]/g, '');
      return parseFloat(cleanValue) || 0;
    };

    // Get all income values
    const employment = cleanAndParse(formData.employmentIncome);
    const socialSecurity = cleanAndParse(formData.socialSecurityIncome);
    const pension = cleanAndParse(formData.pensionIncome);
    const survivorship = cleanAndParse(formData.survivorshipIncome);
    
    // Get investment income if available
    let investmentIncome = 0;
    if (formData.selectedInvestments_total) {
      investmentIncome = cleanAndParse(formData.selectedInvestments_total);
    }
    
    // Calculate what the total should be
    const calculatedTotal = employment + socialSecurity + pension + survivorship + investmentIncome;
    
    // Get the current total from the form data
    const currentTotal = cleanAndParse(formData.primaryTotalIncome);
    
    // Check if there's a discrepancy
    const hasDiscrepancy = Math.abs(calculatedTotal - currentTotal) > 0.01;
    
    console.log("INCOME DEBUGGER - Detailed Income Analysis:", {
      rawValues: {
        employmentIncome: formData.employmentIncome,
        socialSecurityIncome: formData.socialSecurityIncome,
        pensionIncome: formData.pensionIncome,
        survivorshipIncome: formData.survivorshipIncome,
        selectedInvestments_total: formData.selectedInvestments_total,
        primaryTotalIncome: formData.primaryTotalIncome,
        totalIncome: formData.totalIncome,
      },
      parsedValues: {
        employment,
        socialSecurity,
        pension,
        survivorship,
        investmentIncome,
        currentTotal,
        calculatedTotal
      },
      analysis: {
        hasDiscrepancy,
        difference: calculatedTotal - currentTotal
      }
    });
    
  }, [
    formData.employmentIncome,
    formData.socialSecurityIncome,
    formData.pensionIncome,
    formData.survivorshipIncome,
    formData.selectedInvestments_total,
    formData.primaryTotalIncome,
    formData.totalIncome
  ]);

  // This component doesn't render anything visible
  return null;
};

export default IncomeDebugger; 