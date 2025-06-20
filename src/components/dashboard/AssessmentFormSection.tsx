import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import FormContainer from "@/components/FormContainer";

interface AssessmentFormSectionProps {
  isFormOpen: boolean;
  setIsFormOpen: (isOpen: boolean) => void;
}

const AssessmentFormSection = ({ isFormOpen, setIsFormOpen }: AssessmentFormSectionProps) => {
  return (
    <Card className="bg-transparent shadow-none border-none w-full">
      <div className="w-full mx-auto px-2 pt-2">
        <h2 className="text-lg font-bold text-gray-900">Client Assessment</h2>
        <Collapsible open={isFormOpen} onOpenChange={setIsFormOpen} className="w-full">
          <div className="flex items-center justify-between mb-0.5">
            <p className="text-sm text-gray-600">
              Fill out the form below to store your medical information
            </p>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                {isFormOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                <span className="sr-only">Toggle form</span>
              </Button>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent className="w-full">
            <FormContainer />
          </CollapsibleContent>
        </Collapsible>
      </div>
    </Card>
  );
};

export default AssessmentFormSection;
