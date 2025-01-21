import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LeadExpense } from "../types";
import SortButton from "./SortButton";

interface ExpenseTableHeaderProps {
  onSort?: (field: keyof LeadExpense) => void;
}

const ExpenseTableHeader = ({ onSort }: ExpenseTableHeaderProps) => (
  <TableHeader>
    <TableRow>
      <TableHead>
        <div className="flex items-center gap-2">
          Date
          <SortButton field="purchase_date" onSort={onSort} />
        </div>
      </TableHead>
      <TableHead>
        <div className="flex items-center gap-2">
          Source
          <SortButton field="source" onSort={onSort} />
        </div>
      </TableHead>
      <TableHead>Lead Types</TableHead>
      <TableHead>
        <div className="flex items-center gap-2">
          Lead Count
          <SortButton field="lead_count" onSort={onSort} />
        </div>
      </TableHead>
      <TableHead>
        <div className="flex items-center gap-2">
          Total Cost
          <SortButton field="total_cost" onSort={onSort} />
        </div>
      </TableHead>
      <TableHead>Actions</TableHead>
    </TableRow>
  </TableHeader>
);

export default ExpenseTableHeader;