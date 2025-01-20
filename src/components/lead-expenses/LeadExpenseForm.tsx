import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, X } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

  const addLeadType = () => {
    if (newLeadType && !leadTypes.includes(newLeadType)) {
      setLeadTypes([...leadTypes, newLeadType]);
      setNewLeadType("");
    }
  };

  const removeLeadType = (type: string) => {
    setLeadTypes(leadTypes.filter(t => t !== type));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Purchase Date</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={`w-full justify-start text-left font-normal ${!date && "text-muted-foreground"}`}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : "Select date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Source</label>
        <Input
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder="Enter lead source"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Lead Types</label>
        <div className="flex gap-2">
          <Input
            value={newLeadType}
            onChange={(e) => setNewLeadType(e.target.value)}
            placeholder="Add lead type"
          />
          <Button type="button" onClick={addLeadType}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {leadTypes.map((type) => (
            <Badge key={type} variant="secondary" className="flex items-center gap-1">
              {type}
              <button
                type="button"
                onClick={() => removeLeadType(type)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Number of Leads</label>
        <Input
          type="number"
          value={leadCount}
          onChange={(e) => setLeadCount(e.target.value)}
          placeholder="Enter number of leads"
          min="0"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Total Cost</label>
        <div className="relative">
          <span className="absolute left-3 top-2.5">$</span>
          <Input
            type="number"
            value={totalCost}
            onChange={(e) => setTotalCost(e.target.value)}
            placeholder="Enter total cost"
            className="pl-7"
            min="0"
          />
        </div>
      </div>

      <Button type="submit" className="w-full">
        {isEditing ? "Update" : "Add"} Lead Expense
      </Button>
    </form>
  );
};

export default LeadExpenseForm;