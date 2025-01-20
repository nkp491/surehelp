import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";

interface LeadTypeInputProps {
  leadTypes: string[];
  setLeadTypes: (types: string[]) => void;
  newLeadType: string;
  setNewLeadType: (type: string) => void;
}

const LeadTypeInput = ({ leadTypes, setLeadTypes, newLeadType, setNewLeadType }: LeadTypeInputProps) => {
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
  );
};

export default LeadTypeInput;