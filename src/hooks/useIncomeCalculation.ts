import { useState, useEffect } from "react";

interface IncomeFields {
  socialSecurityIncome: string;
  pensionIncome: string;
  survivorshipIncome: string;
  spouseSocialSecurityIncome: string;
  spousePensionIncome: string;
  spouseSurvivorshipIncome: string;
}

export const useIncomeCalculation = (formData: IncomeFields) => {
  const [totalIncome, setTotalIncome] = useState("0.00");
  const [spouseTotalIncome, setSpouseTotalIncome] = useState("0.00");

  useEffect(() => {
    const socialSecurity = parseFloat(formData.socialSecurityIncome) || 0;
    const pension = parseFloat(formData.pensionIncome) || 0;
    const survivorship = parseFloat(formData.survivorshipIncome) || 0;
    const total = socialSecurity + pension + survivorship;
    setTotalIncome(total.toFixed(2));
  }, [formData.socialSecurityIncome, formData.pensionIncome, formData.survivorshipIncome]);

  useEffect(() => {
    const socialSecurity = parseFloat(formData.spouseSocialSecurityIncome) || 0;
    const pension = parseFloat(formData.spousePensionIncome) || 0;
    const survivorship = parseFloat(formData.spouseSurvivorshipIncome) || 0;
    const total = socialSecurity + pension + survivorship;
    setSpouseTotalIncome(total.toFixed(2));
  }, [formData.spouseSocialSecurityIncome, formData.spousePensionIncome, formData.spouseSurvivorshipIncome]);

  return { totalIncome, spouseTotalIncome };
};