import { FormSubmission } from "@/types/form";
import { FormBuilderProvider } from "@/contexts/FormBuilderContext";
import { SpouseVisibilityProvider } from "@/contexts/SpouseVisibilityContext";
import { FamilyMembersProvider } from "@/contexts/FamilyMembersContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import FormContent from "@/components/form/FormContent";
import FamilyMemberToggle from "@/components/form/FamilyMemberToggle";
import LanguageToggle from "@/components/LanguageToggle";

interface FormContainerProps {
  editingSubmission?: FormSubmission | null;
  onUpdate?: (submission: FormSubmission) => void;
}

const FormContainer = ({ editingSubmission, onUpdate }: FormContainerProps) => {
  return (
    <LanguageProvider>
      <FamilyMembersProvider>
        <FormBuilderProvider>
          <SpouseVisibilityProvider>
            <div className="w-full max-w-[98vw] mx-auto">
              <div className="flex justify-end items-center gap-3 mb-1 px-8">
                <FamilyMemberToggle />
                <LanguageToggle />
              </div>
              <div className="bg-grid min-h-[calc(100vh-120px)]">
                <FormContent editingSubmission={editingSubmission} onUpdate={onUpdate} />
              </div>
            </div>
          </SpouseVisibilityProvider>
        </FormBuilderProvider>
      </FamilyMembersProvider>
    </LanguageProvider>
  );
};

export default FormContainer;