import { FormSubmission } from "@/types/form";
import { FormBuilderProvider } from "@/contexts/FormBuilderContext";
import { SpouseVisibilityProvider } from "@/contexts/SpouseVisibilityContext";
import { FamilyMembersProvider } from "@/contexts/FamilyMembersContext";
import FormContent from "@/components/form/FormContent";
import FamilyMemberToggle from "@/components/form/FamilyMemberToggle";

interface FormContainerProps {
  editingSubmission?: FormSubmission | null;
  onUpdate?: (submission: FormSubmission) => void;
}

const FormContainer = ({ editingSubmission, onUpdate }: FormContainerProps) => {
  return (
    <FamilyMembersProvider>
      <FormBuilderProvider>
        <SpouseVisibilityProvider>
          <div className="w-full max-w-[95vw] mx-auto">
            <div className="flex justify-end items-center gap-2 mb-4">
              <FamilyMemberToggle />
            </div>
            <FormContent editingSubmission={editingSubmission} onUpdate={onUpdate} />
          </div>
        </SpouseVisibilityProvider>
      </FormBuilderProvider>
    </FamilyMembersProvider>
  );
};

export default FormContainer;