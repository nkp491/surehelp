import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import DateInput from "./form/DateInput";
import LeadTypeInput from "./form/LeadTypeInput";
import NumericInputs from "./form/NumericInputs";
import { format } from "date-fns";

interface LeadExpenseFormProps {
  onSuccess: () => void;
  initialData?: {
    id: string;
    purchase_date: string;
    source: string;
    lead_type: string[];
    lead_count: number;
    total_cost: number;
  };
  isEditing?: boolean;
}

const LeadExpenseForm = ({ onSuccess, initialData, isEditing = false }: LeadExpenseFormProps) => {
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(
    initialData ? new Date(initialData.purchase_date) : undefined
  );
  const [source, setSource] = useState(initialData?.source || "");
  const [leadTypes, setLeadTypes] = useState<string[]>(initialData?.lead_type || []);
  const [newLeadType, setNewLeadType] = useState("");
  const [leadCount, setLeadCount] = useState(initialData?.lead_count?.toString() || "");
  const [totalCost, setTotalCost] = useState(initialData?.total_cost?.toString() || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !source || leadTypes.length === 0 || !leadCount || !totalCost) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const expenseData = {
        user_id: user.user.id,
        purchase_date: format(date, 'yyyy-MM-dd'),
        source,
        lead_type: leadTypes,
        lead_count: parseInt(leadCount),
        total_cost: parseInt(totalCost),
      };

      if (isEditing && initialData) {
        const { error } = await supabase
          .from('lead_expenses')
          .update(expenseData)
          .eq('id', initialData.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Lead expense updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('lead_expenses')
          .insert(expenseData);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Lead expense added successfully",
        });
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving lead expense:', error);
      toast({
        title: "Error",
        description: "Failed to save lead expense",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DateInput date={date} setDate={setDate} />

      <div className="space-y-2">
        <label className="text-sm font-medium">Source</label>
        <Input
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder="Enter lead source"
        />
      </div>

      <LeadTypeInput
        leadTypes={leadTypes}
        setLeadTypes={setLeadTypes}
        newLeadType={newLeadType}
        setNewLeadType={setNewLeadType}
      />

      <NumericInputs
        leadCount={leadCount}
        setLeadCount={setLeadCount}
        totalCost={totalCost}
        setTotalCost={setTotalCost}
      />

      <Button type="submit" className="w-full">
        {isEditing ? "Update" : "Add"} Lead Expense
      </Button>
    </form>
  );
};

export default LeadExpenseForm;