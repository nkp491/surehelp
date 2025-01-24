import { Button } from "@/components/ui/button";
import { useFormBuilder } from "@/contexts/FormBuilderContext";
import { ToggleLeft, ToggleRight } from "lucide-react";

const EditModeToggle = () => {
  const { isEditMode, setIsEditMode } = useFormBuilder();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setIsEditMode(!isEditMode)}
      className="flex items-center gap-2"
    >
      {isEditMode ? (
        <>
          <ToggleRight className="h-4 w-4" />
          Edit Mode
        </>
      ) : (
        <>
          <ToggleLeft className="h-4 w-4" />
          Use Mode
        </>
      )}
    </Button>
  );
};

export default EditModeToggle;