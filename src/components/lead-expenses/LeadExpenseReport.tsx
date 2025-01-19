import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ExpenseHeader from "./ExpenseHeader";
import ExpenseTable from "./ExpenseTable";
import LeadExpenseForm from "./LeadExpenseForm";
import { useExpenseManagement } from "./useExpenseManagement";

const LeadExpenseReport = () => {
  const {
    expenses,
    isFormOpen,
    editingExpense,
    setIsFormOpen,
    setEditingExpense,
    handleSubmit,
    handleDelete,
  } = useExpenseManagement();

  return (
    <Card className="p-6 bg-[#FFFCF6]">
      <ExpenseHeader onAddClick={() => setIsFormOpen(true)} />
      <ExpenseTable
        expenses={expenses}
        onEdit={(expense) => {
          setEditingExpense(expense);
          setIsFormOpen(true);
        }}
        onDelete={handleDelete}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingExpense ? "Edit Expense" : "Add New Expense"}
            </DialogTitle>
          </DialogHeader>
          <LeadExpenseForm
            onSubmit={handleSubmit}
            initialData={editingExpense || undefined}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingExpense(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default LeadExpenseReport;