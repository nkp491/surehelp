import { useEffect } from "react";

interface DirectTotalIncomeCalculatorProps {
  formData: any;
  setFormData: (data: any) => void;
}

/**
 * This component doesn't render anything visible.
 * It just calculates the total income and updates the form data directly.
 */
const DirectTotalIncomeCalculator: React.FC<DirectTotalIncomeCalculatorProps> = ({
  formData,
  setFormData,
}) => {
  // Calculate and update total income whenever relevant form data changes
  useEffect(() => {
    // Helper function to clean and parse values
    const cleanAndParse = (value: string): number => {
      if (!value) return 0;
      // Remove any non-numeric characters except decimal point
      const cleanValue = value.replace(/[^\d.]/g, "");
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

    // Calculate total
    const total = employment + socialSecurity + pension + survivorship + investmentIncome;

    // Use a consistent field name for the total income
    // Instead of trying multiple field names, use a single consistent one
    setFormData({
      ...formData,
      totalIncome: total.toString(),
      primaryTotalIncome: total.toString(),
    });
  }, [
    formData.employmentIncome,
    formData.socialSecurityIncome,
    formData.pensionIncome,
    formData.survivorshipIncome,
    formData.selectedInvestments_total,
    setFormData,
  ]);

  // This component doesn't render anything visible
  return null;
};

export default DirectTotalIncomeCalculator;
