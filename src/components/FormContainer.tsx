import { FormBuilderProvider } from "@/contexts/FormBuilderContext";
import { SpouseVisibilityProvider } from "@/contexts/SpouseVisibilityContext";
import { FamilyMembersProvider } from "@/contexts/FamilyMembersContext";
import FormContent from "@/components/form/FormContent";
import EditModeToggle from "@/components/form-builder/EditModeToggle";
import FamilyMemberToggle from "@/components/form/FamilyMemberToggle";

const FormContainer = () => {
  return (
    <FamilyMembersProvider>
      <FormBuilderProvider>
        <SpouseVisibilityProvider>
          <div className="max-w-[1024px] mx-auto mt-8 px-4">
            <div className="flex justify-end items-center gap-2 mb-4">
              <FamilyMemberToggle />
              <EditModeToggle />
            </div>
            <FormContent />
          </div>
        </SpouseVisibilityProvider>
      </FormBuilderProvider>
    </FamilyMembersProvider>
  );
};

export default FormContainer;