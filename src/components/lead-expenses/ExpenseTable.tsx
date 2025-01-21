import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit2, Trash2, ArrowUpDown } from "lucide-react";
import LeadExpenseForm from "./LeadExpenseForm";

interface LeadExpense {
  id: string;
  purchase_date: string;
  source: string;
  lead_type: string[];
  lead_count: number;
  total_cost: number;
}

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

  const SortButton = ({ field }: { field: keyof LeadExpense }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0"
      onClick={() => onSort?.(field)}
    >
      <ArrowUpDown className="h-4 w-4" />
    </Button>
  );

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <div className="flex items-center gap-2">
                Date
                <SortButton field="purchase_date" />
              </div>
            </TableHead>
            <TableHead>
              <div className="flex items-center gap-2">
                Source
                <SortButton field="source" />
              </div>
            </TableHead>
            <TableHead>Lead Types</TableHead>
            <TableHead>
              <div className="flex items-center gap-2">
                Lead Count
                <SortButton field="lead_count" />
              </div>
            </TableHead>
            <TableHead>
              <div className="flex items-center gap-2">
                Total Cost
                <SortButton field="total_cost" />
              </div>
            </TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow key={expense.id}>
              <TableCell>{format(new Date(expense.purchase_date), 'MMM dd, yyyy')}</TableCell>
              <TableCell>{expense.source}</TableCell>
              <TableCell>{expense.lead_type.join(', ')}</TableCell>
              <TableCell>{expense.lead_count}</TableCell>
              <TableCell>{formatCurrency(expense.total_cost)}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(expense)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Lead Expense</DialogTitle>
                      </DialogHeader>
                      {selectedExpense && (
                        <LeadExpenseForm
                          initialData={selectedExpense}
                          isEditing
                          onSuccess={onSuccess}
                        />
                      )}
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(expense)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ExpenseTable;