import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { useLanguage } from "@/contexts/LanguageContext";

interface InvestmentTypesCheckboxProps {
  selectedInvestments: string[];
  onChange: (value: string[]) => void;
}

const INVESTMENT_TYPES = {
  en: {
    "401K": "401K",
    "IRA": "IRA",
    "Stocks": "Stocks",
    "Bonds": "Bonds",
    "Mutual Fund": "Mutual Fund",
    "CD": "CD",
    "Savings": "Savings",
    "Credit Union": "Credit Union",
  },
  es: {
    "401K": "401K",
    "IRA": "IRA",
    "Stocks": "Acciones",
    "Bonds": "Bonos",
    "Mutual Fund": "Fondo Mutuo",
    "CD": "CD",
    "Savings": "Ahorros",
    "Credit Union": "Cooperativa de Crédito",
  }
};

const InvestmentTypesCheckbox = ({
  selectedInvestments = [],
  onChange,
}: InvestmentTypesCheckboxProps) => {
  const { language } = useLanguage();
  const investmentTypes = Object.keys(INVESTMENT_TYPES.en);

  const handleCheckboxChange = (type: string) => {
    const currentInvestments = selectedInvestments || [];
    if (currentInvestments.includes(type)) {
      onChange(currentInvestments.filter((t) => t !== type));
    } else {
      onChange([...currentInvestments, type]);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {language === 'en' ? 'Investment Types' : 'Tipos de Inversión'}
      </Label>
      <div className="grid grid-cols-2 gap-4">
        {investmentTypes.map((type) => (
          <div key={type} className="flex items-center space-x-2">
            <Checkbox
              id={type}
              checked={(selectedInvestments || []).includes(type)}
              onCheckedChange={() => handleCheckboxChange(type)}
            />
            <Label htmlFor={type} className="text-sm font-normal">
              {INVESTMENT_TYPES[language][type]}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InvestmentTypesCheckbox;