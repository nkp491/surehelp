import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";

interface InvestmentTypesCheckboxProps {
  selectedInvestments: string[];
  onChange: (value: string[]) => void;
}

const InvestmentTypesCheckbox = ({
  selectedInvestments = [], // Add default empty array
  onChange,
}: InvestmentTypesCheckboxProps) => {
  const investmentTypes = [
    "401K",
    "IRA",
    "Stocks",
    "Bonds",
    "Mutual Fund",
    "CD",
    "Savings",
    "Credit Union",
  ];

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
      <Label className="text-sm font-medium">Investment Types</Label>
      <div className="grid grid-cols-2 gap-4">
        {investmentTypes.map((type) => (
          <div key={type} className="flex items-center space-x-2">
            <Checkbox
              id={type}
              checked={(selectedInvestments || []).includes(type)}
              onCheckedChange={() => handleCheckboxChange(type)}
            />
            <Label htmlFor={type} className="text-sm font-normal">
              {type}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InvestmentTypesCheckbox;