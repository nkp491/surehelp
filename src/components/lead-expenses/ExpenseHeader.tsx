import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ExpenseHeaderProps {
  onAddClick: () => void;
}

const ExpenseHeader = ({ onAddClick }: ExpenseHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-semibold text-[#2A6F97]">Lead Expense Report</h2>
      <Button onClick={onAddClick}>
        <Plus className="h-4 w-4 mr-2" />
        Add Expense
      </Button>
    </div>
  );
};

export default ExpenseHeader;