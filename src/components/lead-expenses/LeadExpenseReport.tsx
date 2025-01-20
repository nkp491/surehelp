import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AddExpenseDialog from "./AddExpenseDialog";
import DeleteExpenseDialog from "./DeleteExpenseDialog";
import ExpenseTable from "./ExpenseTable";

interface LeadExpense {
  id: string;
  purchase_date: string;
  source: string;
  lead_type: string[];
  lead_count: number;
  total_cost: number;
}

const LeadExpenseReport = () => {
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<LeadExpense[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<LeadExpense | null>(null);

  const loadExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from('lead_expenses')
        .select('*')
        .order('purchase_date', { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error('Error loading expenses:', error);
      toast({
        title: "Error",
        description: "Failed to load lead expenses",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleDelete = async () => {
    if (!selectedExpense) return;

    try {
      const { error } = await supabase
        .from('lead_expenses')
        .delete()
        .eq('id', selectedExpense.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Lead expense deleted successfully",
      });

      loadExpenses();
      setIsDeleteOpen(false);
      setSelectedExpense(null);
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({
        title: "Error",
        description: "Failed to delete lead expense",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4 bg-[#FFFCF6] p-6 rounded-lg border border-[#D9D9D9]">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Lead Expense Report</h2>
        <AddExpenseDialog
          isOpen={isAddOpen}
          onOpenChange={setIsAddOpen}
          onSuccess={() => {
            loadExpenses();
            setIsAddOpen(false);
          }}
        />
      </div>

      <ExpenseTable
        expenses={expenses}
        onEdit={(expense) => setSelectedExpense(expense)}
        onDelete={(expense) => {
          setSelectedExpense(expense);
          setIsDeleteOpen(true);
        }}
        isEditOpen={isEditOpen}
        setIsEditOpen={setIsEditOpen}
        selectedExpense={selectedExpense}
        onSuccess={() => {
          loadExpenses();
          setIsEditOpen(false);
          setSelectedExpense(null);
        }}
      />

      <DeleteExpenseDialog
        isOpen={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleDelete}
        onCancel={() => setSelectedExpense(null)}
      />
    </div>
  );
};

export default LeadExpenseReport;