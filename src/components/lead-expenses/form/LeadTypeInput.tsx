
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LeadTypeInputProps {
  leadTypes: string[];
  setLeadTypes: (types: string[]) => void;
  newLeadType: string;
  setNewLeadType: (type: string) => void;
}

const LeadTypeInput = ({ leadTypes, setLeadTypes, newLeadType, setNewLeadType }: LeadTypeInputProps) => {
  const [existingTypes, setExistingTypes] = useState<string[]>([]);

  useEffect(() => {
    const fetchExistingTypes = async () => {
      const { data, error } = await supabase
        .from('lead_expenses')
        .select('lead_type');
      
      if (error) {
        console.error('Error fetching lead types:', error);
        return;
      }

      // Flatten and get unique lead types
      const uniqueTypes = Array.from(new Set(
        data.flatMap(expense => {
          const leadType = expense.lead_type;
          return Array.isArray(leadType) ? leadType : [];
        })
      )).sort() as string[];

      setExistingTypes(uniqueTypes);
    };

    fetchExistingTypes();
  }, []);

  const addLeadType = () => {
    if (newLeadType && !leadTypes.includes(newLeadType)) {
      setLeadTypes([...leadTypes, newLeadType]);
      setNewLeadType("");
    }
  };

  const removeLeadType = (type: string) => {
    setLeadTypes(leadTypes.filter(t => t !== type));
  };

  const handleExistingTypeSelect = (type: string) => {
    if (!leadTypes.includes(type)) {
      setLeadTypes([...leadTypes, type]);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Lead Types</label>
      <div className="flex flex-col gap-2">
        <Select onValueChange={handleExistingTypeSelect}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select existing lead type" />
          </SelectTrigger>
          <SelectContent>
            {existingTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="flex gap-2">
          <Input
            value={newLeadType}
            onChange={(e) => setNewLeadType(e.target.value)}
            placeholder="Or add a new lead type"
          />
          <Button type="button" onClick={addLeadType}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
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
  );
};

export default LeadTypeInput;
