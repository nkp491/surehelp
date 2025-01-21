import { Input } from "@/components/ui/input";

interface NumericInputsProps {
  leadCount: string;
  setLeadCount: (value: string) => void;
  totalCost: string;
  setTotalCost: (value: string) => void;
}

const NumericInputs = ({ leadCount, setLeadCount, totalCost, setTotalCost }: NumericInputsProps) => {
  // Convert cents to dollars for display
  const displayValue = totalCost ? (parseInt(totalCost) / 100).toFixed(2) : '';

  const handleTotalCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      setTotalCost('');
      return;
    }
    
    // Convert the dollar amount to cents for storage
    const dollars = parseFloat(value);
    if (!isNaN(dollars)) {
      const cents = Math.round(dollars * 100);
      setTotalCost(cents.toString());
    }
  };

  return (
    <>
      <div className="space-y-2">
        <label className="text-sm font-medium">Number of Leads</label>
        <Input
          type="number"
          value={leadCount}
          onChange={(e) => setLeadCount(e.target.value)}
          placeholder="Enter number of leads"
          min="0"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Total Cost</label>
        <div className="relative">
          <span className="absolute left-3 top-2.5">$</span>
          <Input
            type="number"
            value={displayValue}
            onChange={handleTotalCostChange}
            placeholder="Enter total cost"
            className="pl-7"
            min="0"
            step="0.01"
          />
        </div>
      </div>
    </>
  );
};

export default NumericInputs;