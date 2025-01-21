import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { LeadExpense } from "./types";
import ExpenseTableHeader from "./table/ExpenseTableHeader";
import ExpenseRowActions from "./table/ExpenseRowActions";

interface ExpenseTableProps {
  expenses: LeadExpense[];
  onEdit: (expense: LeadExpense) => void;
  onDelete: (expense: LeadExpense) => void;
  isEditOpen: boolean;
  setIsEditOpen: (open: boolean) => void;
  selectedExpense: LeadExpense | null;
  onSuccess: () => void;
  onSort?: (field: keyof LeadExpense) => void;
}

const ExpenseTable = ({ 
  expenses, 
  onEdit, 
  onDelete, 
  isEditOpen, 
  setIsEditOpen, 
  selectedExpense,
  onSuccess,
  onSort 
}: ExpenseTableProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount / 100);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <ExpenseTableHeader onSort={onSort} />
        <TableBody>
          {expenses.map((expense) => (
            <TableRow key={expense.id}>
              <TableCell>{format(new Date(expense.purchase_date), 'MMM dd, yyyy')}</TableCell>
              <TableCell>{expense.source}</TableCell>
              <TableCell>{expense.lead_type.join(', ')}</TableCell>
              <TableCell>{expense.lead_count}</TableCell>
              <TableCell>{formatCurrency(expense.total_cost)}</TableCell>
              <TableCell>
                <ExpenseRowActions
                  expense={expense}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  isEditOpen={isEditOpen}
                  setIsEditOpen={setIsEditOpen}
                  selectedExpense={selectedExpense}
                  onSuccess={onSuccess}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ExpenseTable;