import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import FormContainer from "@/components/FormContainer";

interface AssessmentFormSectionProps {
  isFormOpen: boolean;
  setIsFormOpen: (isOpen: boolean) => void;
}

const AssessmentFormSection = ({
  isFormOpen,
  setIsFormOpen,
}: AssessmentFormSectionProps) => {
  return (
    <Card className="bg-transparent shadow-none border-none">
      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-gray-900">Client Assessment</h2>
        <Collapsible
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-lg text-gray-600">
              Fill out the form below to store your medical information
            </p>
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
      </div>
    </Card>
  );
};

export default AssessmentFormSection;