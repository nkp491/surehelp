import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2 } from "lucide-react";
import { LeadExpense } from "@/types/leadExpense";

interface ExpenseTableProps {
  expenses: LeadExpense[];
  onEdit: (expense: LeadExpense) => void;
  onDelete: (id: string) => void;
}

const ExpenseTable = ({ expenses, onEdit, onDelete }: ExpenseTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Source</TableHead>
          <TableHead>Lead Types</TableHead>
          <TableHead className="text-right">Lead Count</TableHead>
          <TableHead className="text-right">Total Cost</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {expenses.map((expense) => (
          <TableRow key={expense.id}>
            <TableCell>{format(new Date(expense.purchase_date), "PP")}</TableCell>
            <TableCell>{expense.source}</TableCell>
            <TableCell>{expense.lead_type.join(", ")}</TableCell>
            <TableCell className="text-right">{expense.lead_count}</TableCell>
            <TableCell className="text-right">
              ${(expense.total_cost / 100).toFixed(2)}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(expense)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(expense.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ExpenseTable;