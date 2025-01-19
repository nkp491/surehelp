import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LeadExpense, LeadExpenseFormData } from "@/types/leadExpense";

export const useExpenseManagement = () => {
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

  useEffect(() => {
    loadExpenses();
  }, []);

  return {
    expenses,
    isFormOpen,
    editingExpense,
    setIsFormOpen,
    setEditingExpense,
    handleSubmit,
    handleDelete,
  };
};