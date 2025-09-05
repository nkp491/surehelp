import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AddExpenseDialog from "./AddExpenseDialog";
import DeleteExpenseDialog from "./DeleteExpenseDialog";
import ExpenseTable from "./ExpenseTable";
import ExpenseSearch from "./ExpenseSearch";
import { TableSkeleton } from "../ui/loading-skeleton";

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
  const [filteredExpenses, setFilteredExpenses] = useState<LeadExpense[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<LeadExpense | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{
    field: keyof LeadExpense;
    direction: 'asc' | 'desc';
  }>({ field: 'purchase_date', direction: 'desc' });

  const loadExpenses = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('lead_expenses')
        .select('*')
        .order('purchase_date', { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
      setFilteredExpenses(data || []);
    } catch (error) {
      console.error('Error loading expenses:', error);
      toast({
        title: "Error",
        description: "Failed to load lead expenses",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleSearch = ({ searchTerm, selectedTags, sortField, sortDirection }: {
    searchTerm: string;
    selectedTags: string[];
    sortField: string;
    sortDirection: 'asc' | 'desc';
  }) => {
    let filtered = [...expenses];

    // Apply search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(expense => 
        expense.source.toLowerCase().includes(searchLower) ||
        expense.lead_type.some(tag => tag.toLowerCase().includes(searchLower)) ||
        expense.lead_count.toString().includes(searchLower) ||
        expense.total_cost.toString().includes(searchLower)
      );
    }

    // Apply tag filters
    if (selectedTags.length > 0) {
      filtered = filtered.filter(expense =>
        selectedTags.every(tag => expense.lead_type.includes(tag))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortField as keyof LeadExpense];
      const bValue = b[sortField as keyof LeadExpense];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return sortDirection === 'asc'
        ? Number(aValue) - Number(bValue)
        : Number(bValue) - Number(aValue);
    });

    setFilteredExpenses(filtered);
  };

  const handleSort = (field: keyof LeadExpense) => {
    const direction = sortConfig.field === field && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ field, direction });
    
    const sorted = [...filteredExpenses].sort((a, b) => {
      const aValue = a[field];
      const bValue = b[field];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return direction === 'asc'
        ? Number(aValue) - Number(bValue)
        : Number(bValue) - Number(aValue);
    });
    
    setFilteredExpenses(sorted);
  };

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
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">LEAD EXPENSE REPORT</h2>
        <AddExpenseDialog
          isOpen={isAddOpen}
          onOpenChange={setIsAddOpen}
          onSuccess={() => {
            loadExpenses();
            setIsAddOpen(false);
          }}
        />
      </div>

      <ExpenseSearch onSearch={handleSearch} />

      {(() => {
        if (isLoading) {
          return <TableSkeleton rows={5} />;
        }
        if (filteredExpenses.length === 0) {
          return (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Lead Expenses Found</h3>
            <p className="text-gray-500 mb-4">
              {(() => {
                if (expenses.length === 0) {
                  return "Start tracking your lead expenses to see them here.";
                }
                return "No expenses match your current search criteria.";
              })()}
            </p>
            {expenses.length === 0 && (
              <button
                onClick={() => setIsAddOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add First Expense
              </button>
            )}
          </div>
        </div>
          );
        }
        return (
          <ExpenseTable
            expenses={filteredExpenses}
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
            onSort={handleSort}
          />
        );
      })()}

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