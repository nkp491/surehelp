import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { LeadExpense } from "../types";

interface SortButtonProps {
  field: keyof LeadExpense;
  onSort?: (field: keyof LeadExpense) => void;
}

const SortButton = ({ field, onSort }: SortButtonProps) => (
  <Button
    variant="ghost"
    size="sm"
    className="h-8 w-8 p-0"
    onClick={() => onSort?.(field)}
  >
    <ArrowUpDown className="h-4 w-4" />
  </Button>
);

export default SortButton;