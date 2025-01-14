import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import FormContainer from "@/components/FormContainer";

interface AssessmentFormSectionProps {
  isFormOpen: boolean;
  setIsFormOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const AssessmentFormSection = ({ isFormOpen, setIsFormOpen }: AssessmentFormSectionProps) => {
  return (
    <Collapsible
      open={isFormOpen}
      onOpenChange={setIsFormOpen}
      className="mt-12"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Client Assessment
          </h2>
          <p className="text-lg text-gray-600">
            Fill out the form below to store your medical information
          </p>
        </div>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-9 p-0">
            {isFormOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle form</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      
      <CollapsibleContent>
        <FormContainer />
      </CollapsibleContent>
    </Collapsible>
  );
};

export default AssessmentFormSection;