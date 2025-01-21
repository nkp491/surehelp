import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit2, Trash2 } from "lucide-react";
import { LeadExpense } from "../types";
import LeadExpenseForm from "../LeadExpenseForm";

interface ExpenseRowActionsProps {
  expense: LeadExpense;
  onEdit: (expense: LeadExpense) => void;
  onDelete: (expense: LeadExpense) => void;
  isEditOpen: boolean;
  setIsEditOpen: (open: boolean) => void;
  selectedExpense: LeadExpense | null;
  onSuccess: () => void;
}

const ExpenseRowActions = ({
  expense,
  onEdit,
  onDelete,
  isEditOpen,
  setIsEditOpen,
  selectedExpense,
  onSuccess,
}: ExpenseRowActionsProps) => (
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
);

export default ExpenseRowActions;