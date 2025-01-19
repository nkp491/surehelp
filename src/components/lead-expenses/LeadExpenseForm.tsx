import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { LeadExpenseFormData } from "@/types/leadExpense";
import { useToast } from "@/components/ui/use-toast";

interface LeadExpenseFormProps {
  onSubmit: (data: LeadExpenseFormData) => Promise<void>;
  initialData?: LeadExpenseFormData;
  onCancel?: () => void;
}

const LeadExpenseForm = ({ onSubmit, initialData, onCancel }: LeadExpenseFormProps) => {
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(
    initialData?.purchase_date ? new Date(initialData.purchase_date) : undefined
  );
  const [source, setSource] = useState(initialData?.source || "");
  const [leadTypes, setLeadTypes] = useState<string[]>(initialData?.lead_type || []);
  const [newLeadType, setNewLeadType] = useState("");
  const [leadCount, setLeadCount] = useState(initialData?.lead_count?.toString() || "");
  const [totalCost, setTotalCost] = useState(
    initialData?.total_cost ? (initialData.total_cost / 100).toString() : ""
  );

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

    const formData: LeadExpenseFormData = {
      purchase_date: format(date, "yyyy-MM-dd"),
      source,
      lead_type: leadTypes,
      lead_count: parseInt(leadCount),
      total_cost: Math.round(parseFloat(totalCost) * 100), // Convert to cents
    };

    await onSubmit(formData);
  };

  const addLeadType = () => {
    if (newLeadType && !leadTypes.includes(newLeadType)) {
      setLeadTypes([...leadTypes, newLeadType]);
      setNewLeadType("");
    }
  };

  const removeLeadType = (type: string) => {
    setLeadTypes(leadTypes.filter((t) => t !== type));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Date of Purchase</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : "Select date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
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
        <Label>Source</Label>
        <Input
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder="Enter lead source"
        />
      </div>

      <div className="space-y-2">
        <Label>Lead Types</Label>
        <div className="flex gap-2">
          <Input
            value={newLeadType}
            onChange={(e) => setNewLeadType(e.target.value)}
            placeholder="Add lead type"
          />
          <Button type="button" onClick={addLeadType} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {leadTypes.map((type) => (
            <Badge key={type} variant="secondary" className="gap-1">
              {type}
              <button
                type="button"
                onClick={() => removeLeadType(type)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Number of Leads</Label>
        <Input
          type="number"
          min="1"
          value={leadCount}
          onChange={(e) => setLeadCount(e.target.value)}
          placeholder="Enter number of leads"
        />
      </div>

      <div className="space-y-2">
        <Label>Total Cost</Label>
        <div className="relative">
          <span className="absolute left-3 top-2.5">$</span>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={totalCost}
            onChange={(e) => setTotalCost(e.target.value)}
            placeholder="0.00"
            className="pl-7"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit">Submit</Button>
      </div>
    </form>
  );
};

export default LeadExpenseForm;