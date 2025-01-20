import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import LeadExpenseForm from "./LeadExpenseForm";

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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Lead Expense Report</h2>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Lead Expense</DialogTitle>
            </DialogHeader>
            <LeadExpenseForm
              onSuccess={() => {
                loadExpenses();
                setIsAddOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

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
                          onClick={() => setSelectedExpense(expense)}
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
                            onSuccess={() => {
                              loadExpenses();
                              setIsEditOpen(false);
                              setSelectedExpense(null);
                            }}
                          />
                        )}
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedExpense(expense);
                        setIsDeleteOpen(true);
                      }}
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

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the lead expense record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedExpense(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default LeadExpenseReport;