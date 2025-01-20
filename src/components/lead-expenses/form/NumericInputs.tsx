import { Input } from "@/components/ui/input";

interface NumericInputsProps {
  leadCount: string;
  setLeadCount: (value: string) => void;
  totalCost: string;
  setTotalCost: (value: string) => void;
}

const NumericInputs = ({ leadCount, setLeadCount, totalCost, setTotalCost }: NumericInputsProps) => {
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
            value={totalCost}
            onChange={(e) => setTotalCost(e.target.value)}
            placeholder="Enter total cost"
            className="pl-7"
            min="0"
          />
        </div>
      </div>
    </>
  );
};

export default NumericInputs;