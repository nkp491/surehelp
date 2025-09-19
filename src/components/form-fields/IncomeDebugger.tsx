import { useEffect } from "react";

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
      const cleanValue = value.replace(/[^\d.]/g, "");
      return parseFloat(cleanValue) || 0;
    };

  

    // Get investment income if available

    // Calculate what the total should be

    // Get the current total from the form data
  }, [
    formData.employmentIncome,
    formData.socialSecurityIncome,
    formData.pensionIncome,
    formData.survivorshipIncome,
    formData.selectedInvestments_total,
    formData.primaryTotalIncome,
    formData.totalIncome,
  ]);

  // This component doesn't render anything visible
  return null;
};

export default IncomeDebugger;
