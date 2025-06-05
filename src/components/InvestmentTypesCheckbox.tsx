import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect, useMemo } from "react";

interface InvestmentTypesCheckboxProps {
  selectedInvestments: string[];
  onChange: (value: string[]) => void;
  investmentAmounts?: Record<string, string>;
  onAmountChange?: (type: string, amount: string) => void;
  onTotalChange?: (total: number) => void;
}

const INVESTMENT_TYPES = {
  en: {
    "401K": "401K",
    IRA: "IRA",
    Stocks: "Stocks",
    Bonds: "Bonds",
    "Mutual Fund": "Mutual Fund",
    CD: "CD",
    Savings: "Savings",
    "Credit Union": "Credit Union",
  },
  es: {
    "401K": "401K",
    IRA: "IRA",
    Stocks: "Acciones",
    Bonds: "Bonos",
    "Mutual Fund": "Fondo Mutuo",
    CD: "CD",
    Savings: "Ahorros",
    "Credit Union": "Cooperativa de Crédito",
  },
};

const InvestmentTypesCheckbox = ({
  selectedInvestments = [],
  onChange,
  investmentAmounts = {},
  onAmountChange = () => {},
  onTotalChange = () => {},
}: InvestmentTypesCheckboxProps) => {
  const { language } = useLanguage();
  const investmentTypes = Object.keys(INVESTMENT_TYPES.en);

  // Keep a local copy of the amounts that we'll update immediately for UI responsiveness
  const [localAmounts, setLocalAmounts] = useState<Record<string, string>>(investmentAmounts);

  // Update local state when props change
  useEffect(() => {
    setLocalAmounts((prevAmounts) => {
      // Merge the incoming amounts with our local state to preserve values
      return { ...prevAmounts, ...investmentAmounts };
    });
  }, [investmentAmounts]);

  const handleCheckboxChange = (type: string) => {
    const currentInvestments = [...(selectedInvestments || [])];

    if (currentInvestments.includes(type)) {
      // Unchecking - remove from selected investments
      const newInvestments = currentInvestments.filter((t) => t !== type);
      onChange(newInvestments);
    } else {
      // Checking - add to selected investments
      const newInvestments = [...currentInvestments, type];
      onChange(newInvestments);

      // If we have a saved amount for this type, make sure it's reflected in the parent
      if (localAmounts[type]) {
        onAmountChange(type, localAmounts[type]);
      }
    }
  };

  const handleAmountChange = (type: string, value: string) => {
    // Update local state immediately for UI responsiveness
    setLocalAmounts((prev) => ({
      ...prev,
      [type]: value,
    }));
    // Notify parent component
    onAmountChange(type, value);
  };

  // Calculate total investment income from checked investments
  const totalInvestmentIncome = useMemo(() => {
    const total = selectedInvestments.reduce((total, type) => {
      const amount = localAmounts[type] || "0";
      // Remove any non-numeric characters except decimal point
      const cleanAmount = amount.replace(/[^\d.]/g, "");
      const numAmount = parseFloat(cleanAmount) || 0;
      return total + numAmount;
    }, 0);

    return total;
  }, [selectedInvestments, localAmounts]);

  // Notify parent component when total changes
  useEffect(() => {
    onTotalChange(totalInvestmentIncome);
  }, [totalInvestmentIncome, onTotalChange]);

  // Format the total with commas and two decimal places
  const formattedTotal = totalInvestmentIncome.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">
        {language === "en" ? "Investment Types" : "Tipos de Inversión"}
      </Label>
      <div className="grid grid-cols-2 gap-y-4 gap-x-6">
        {investmentTypes.map((type) => {
          const isChecked = (selectedInvestments || []).includes(type);
          // Use the local amount if available, otherwise fall back to the prop
          const amountValue = localAmounts[type] || "";

          return (
            <div key={type} className="flex items-center">
              <Checkbox
                id={type}
                checked={isChecked}
                onCheckedChange={() => handleCheckboxChange(type)}
                className="h-5 w-5 border-2 mr-2"
              />
              <Label htmlFor={type} className="text-sm font-medium mr-2">
                {INVESTMENT_TYPES[language][type]}
              </Label>
              {isChecked && (
                <div className="flex items-center h-8 px-2 bg-white border border-gray-300 rounded-md w-[70px] shadow-sm">
                  <span className="text-gray-500 mr-1 font-medium">$</span>
                  <input
                    type="text"
                    placeholder="A"
                    className="bg-transparent border-none outline-none w-full text-sm focus:ring-0 p-0 text-black font-medium"
                    value={amountValue}
                    onChange={(e) => handleAmountChange(type, e.target.value)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Total Investment Income Field */}
      {selectedInvestments.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">
              {language === "en" ? "Total Investment Income" : "Ingreso Total de Inversiones"}
            </Label>
            <div className="flex items-center h-10 px-3 bg-gray-50 border border-gray-300 rounded-md shadow-sm">
              <span className="text-gray-500 mr-1 font-medium">$</span>
              <div className="bg-transparent w-full text-sm p-0 text-black font-medium">
                {formattedTotal}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestmentTypesCheckbox;
