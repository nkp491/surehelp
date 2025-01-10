import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import { useSpouseVisibility } from "@/contexts/SpouseVisibilityContext";

const SpouseToggle = () => {
  const { showSpouse, toggleSpouse } = useSpouseVisibility();

  return (
    <Button
      onClick={toggleSpouse}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      {showSpouse ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
      Spouse
    </Button>
  );
};

export default SpouseToggle;