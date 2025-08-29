import { useState, useEffect } from "react";

interface IncomeFields {
  employmentIncome: string;
  socialSecurityIncome: string;
  pensionIncome: string;
  survivorshipIncome: string;
  spouseEmploymentIncome: string;
  spouseSocialSecurityIncome: string;
  spousePensionIncome: string;
  spouseSurvivorshipIncome: string;
  selectedInvestments?: string[];
  selectedInvestments_amounts?: Record<string, string>;
  selectedInvestments_total?: string;
  spouseSelectedInvestments?: string[];
  spouseSelectedInvestments_amounts?: Record<string, string>;
  spouseSelectedInvestments_total?: string;
  _lastUpdate?: number;
}

export const useIncomeCalculation = (formData: IncomeFields) => {
  const [totalIncome, setTotalIncome] = useState("0.00");
  const [spouseTotalIncome, setSpouseTotalIncome] = useState("0.00");

  // Helper function to clean and parse income values
  const cleanAndParse = (value: string | undefined): number => {
    if (!value) return 0;
    // Remove any non-numeric characters except decimal point
    const cleanValue = value.replace(/[^\d.]/g, "");
    return parseFloat(cleanValue) || 0;
  };

  useEffect(() => {
    // Early return if formData is undefined or null
    if (!formData) {
      setTotalIncome("0.00");
      return;
    }

    // Get investment income from the pre-calculated total if available
    let investmentIncome = 0;

    // DIRECT ACCESS: Check if we have a selectedInvestments_total field
    if (formData?.selectedInvestments_total) {
      investmentIncome = cleanAndParse(formData.selectedInvestments_total);
    }
    // If not available, calculate it from the individual investments
    else if (formData?.selectedInvestments && formData?.selectedInvestments_amounts) {
      investmentIncome = formData.selectedInvestments.reduce((total, type) => {
        const amount = formData.selectedInvestments_amounts?.[type] || "0";
        const numAmount = cleanAndParse(amount);
        return total + numAmount;
      }, 0);
    }

    // Parse other income values with safe property access
    const employment = cleanAndParse(formData?.employmentIncome);
    const socialSecurity = cleanAndParse(formData?.socialSecurityIncome);
    const pension = cleanAndParse(formData?.pensionIncome);
    const survivorship = cleanAndParse(formData?.survivorshipIncome);

    // Calculate total income
    const total = employment + socialSecurity + pension + survivorship + investmentIncome;

    // Update the total income state
    setTotalIncome(total.toFixed(2));
  }, [
    formData?.employmentIncome,
    formData?.socialSecurityIncome,
    formData?.pensionIncome,
    formData?.survivorshipIncome,
    formData?.selectedInvestments,
    formData?.selectedInvestments_amounts,
    formData?.selectedInvestments_total,
    formData?._lastUpdate,
  ]);

  useEffect(() => {
    // Early return if formData is undefined or null
    if (!formData) {
      setSpouseTotalIncome("0.00");
      return;
    }

    // Get spouse investment income from the pre-calculated total if available
    let spouseInvestmentIncome = 0;
    if (formData?.spouseSelectedInvestments_total) {
      spouseInvestmentIncome = cleanAndParse(formData.spouseSelectedInvestments_total);
    }
    // If not available, calculate it from the individual investments
    else if (formData?.spouseSelectedInvestments && formData?.spouseSelectedInvestments_amounts) {
      spouseInvestmentIncome = formData.spouseSelectedInvestments.reduce((total, type) => {
        const amount = formData.spouseSelectedInvestments_amounts?.[type] || "0";
        const numAmount = cleanAndParse(amount);
        return total + numAmount;
      }, 0);
    }

    const employment = cleanAndParse(formData?.spouseEmploymentIncome);
    const socialSecurity = cleanAndParse(formData?.spouseSocialSecurityIncome);
    const pension = cleanAndParse(formData?.spousePensionIncome);
    const survivorship = cleanAndParse(formData?.spouseSurvivorshipIncome);
    const total = employment + socialSecurity + pension + survivorship + spouseInvestmentIncome;
    setSpouseTotalIncome(total.toFixed(2));
  }, [
    formData?.spouseEmploymentIncome,
    formData?.spouseSocialSecurityIncome,
    formData?.spousePensionIncome,
    formData?.spouseSurvivorshipIncome,
    formData?.spouseSelectedInvestments,
    formData?.spouseSelectedInvestments_amounts,
    formData?.spouseSelectedInvestments_total,
    formData?._lastUpdate,
  ]);

  return { totalIncome, spouseTotalIncome };
};
