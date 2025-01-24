import { FormSubmission } from "@/types/form";
import { MetricsProvider } from "@/contexts/MetricsContext";
import { FamilyMembersProvider } from "@/contexts/FamilyMembersContext";
import { FormBuilderProvider } from "@/contexts/FormBuilderContext";
import FormContent from "@/components/form/FormContent";
import EditModeToggle from "./form-builder/EditModeToggle";

interface FormContainerProps {
  editingSubmission?: FormSubmission | null;
  onUpdate?: (submission: FormSubmission) => void;
}

const FormContainer = ({ editingSubmission, onUpdate }: FormContainerProps) => {
  return (
    <MetricsProvider>
      <FamilyMembersProvider>
        <FormBuilderProvider>
          <div className="space-y-4">
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-2">
              <div className="flex justify-end items-center mb-4">
                <EditModeToggle />
              </div>
            </div>
            <FormContent editingSubmission={editingSubmission} onUpdate={onUpdate} />
          </div>
        </FormBuilderProvider>
      </FamilyMembersProvider>
    </MetricsProvider>
  );
};

export default FormContainer;