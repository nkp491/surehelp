import { FormSubmission } from "@/types/form";
import { MetricsProvider } from "@/contexts/MetricsContext";
import { FamilyMembersProvider } from "@/contexts/FamilyMembersContext";
import { FormBuilderProvider } from "@/contexts/FormBuilderContext";
import { SpouseVisibilityProvider } from "@/contexts/SpouseVisibilityContext";
import FormContent from "@/components/form/FormContent";
import EditModeToggle from "./form-builder/EditModeToggle";
import SpouseToggle from "./form/SpouseToggle";

interface FormContainerProps {
  editingSubmission?: FormSubmission | null;
  onUpdate?: (submission: FormSubmission) => void;
}

const FormContainer = ({ editingSubmission, onUpdate }: FormContainerProps) => {
  return (
    <MetricsProvider>
      <FamilyMembersProvider>
        <FormBuilderProvider>
          <SpouseVisibilityProvider>
            <div className="space-y-2">
              <div className="flex justify-end items-center gap-2">
                <SpouseToggle />
                <EditModeToggle />
              </div>
              <FormContent editingSubmission={editingSubmission} onUpdate={onUpdate} />
            </div>
          </SpouseVisibilityProvider>
        </FormBuilderProvider>
      </FamilyMembersProvider>
    </MetricsProvider>
  );
};

export default FormContainer;