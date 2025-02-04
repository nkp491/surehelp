import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import { useFamilyMembers } from "@/contexts/FamilyMembersContext";
import { toast } from "@/hooks/use-toast";
import FormSection from "@/components/FormSection";
import { INITIAL_FIELDS } from "./FormFields";

const FamilyMemberToggle = () => {
  const { familyMembers, addFamilyMember, removeFamilyMember } = useFamilyMembers();

  const handleAddFamilyMember = () => {
    if (familyMembers.length >= 5) {
      toast({
        title: "Maximum limit reached",
        description: "You can only add up to 5 family members",
        variant: "destructive",
      });
      return;
    }
    addFamilyMember();
  };

  const handleRemoveFamilyMember = () => {
    if (familyMembers.length > 0) {
      removeFamilyMember(familyMembers[familyMembers.length - 1].id);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        onClick={handleAddFamilyMember}
        variant="outline"
        size="sm"
        className="h-6 px-2 text-xs flex items-center gap-1"
      >
        <Plus className="h-3 w-3" />
        {familyMembers.length}/5
      </Button>
      {familyMembers.length > 0 && (
        <Button
          onClick={handleRemoveFamilyMember}
          variant="outline"
          size="sm"
          className="h-6 px-2 text-xs"
        >
          <Minus className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
};

export default FamilyMemberToggle;