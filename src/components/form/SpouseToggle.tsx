import { Toggle } from "@/components/ui/toggle";
import { useSpouseVisibility } from "@/contexts/SpouseVisibilityContext";
import { Users } from "lucide-react";

const SpouseToggle = () => {
  const { showSpouse, toggleSpouse } = useSpouseVisibility();

  return (
    <Toggle
      pressed={showSpouse}
      onPressedChange={toggleSpouse}
      aria-label="Toggle spouse fields"
      className="flex items-center gap-2"
    >
      <Users className="h-4 w-4" />
      Spouse
    </Toggle>
  );
};

export default SpouseToggle;