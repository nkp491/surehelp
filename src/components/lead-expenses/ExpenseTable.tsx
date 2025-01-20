import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit2, Trash2 } from "lucide-react";
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
}

const ExpenseTable = ({ 
  expenses, 
  onEdit, 
  onDelete, 
  isEditOpen, 
  setIsEditOpen, 
  selectedExpense,
  onSuccess 
}: ExpenseTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Lead Types</TableHead>
            <TableHead>Lead Count</TableHead>
            <TableHead>Total Cost</TableHead>
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
              <TableCell>${expense.total_cost}</TableCell>
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