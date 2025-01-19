import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LeadExpense, LeadExpenseFormData } from "@/types/leadExpense";
import LeadExpenseForm from "./LeadExpenseForm";

const LeadExpenseReport = () => {
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<LeadExpense[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<LeadExpense | null>(null);

  const loadExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from("lead_expenses")
        .select("*")
        .order("purchase_date", { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error("Error loading expenses:", error);
      toast({
        title: "Error",
        description: "Failed to load expenses",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleSubmit = async (formData: LeadExpenseFormData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("No authenticated user found");
      }

      if (editingExpense) {
        const { error } = await supabase
          .from("lead_expenses")
          .update({ ...formData })
          .eq("id", editingExpense.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Expense updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("lead_expenses")
          .insert({ ...formData, user_id: user.id });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Expense added successfully",
        });
      }

      setIsFormOpen(false);
      setEditingExpense(null);
      loadExpenses();
    } catch (error) {
      console.error("Error saving expense:", error);
      toast({
        title: "Error",
        description: "Failed to save expense",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("lead_expenses")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Expense deleted successfully",
      });

      loadExpenses();
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast({
        title: "Error",
        description: "Failed to delete expense",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Lead Expense Report</h2>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </div>

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
                    onClick={() => {
                      setEditingExpense(expense);
                      setIsFormOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(expense.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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