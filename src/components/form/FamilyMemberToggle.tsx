import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useFamilyMembers } from "@/contexts/FamilyMembersContext";
import { toast } from "@/hooks/use-toast";

const FamilyMemberToggle = () => {
  const { familyMembers, addFamilyMember } = useFamilyMembers();

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

  return (
    <Button
      onClick={handleAddFamilyMember}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <Plus className="h-4 w-4" />
      Add Family Member ({familyMembers.length}/5)
    </Button>
  );
};

export default FamilyMemberToggle;