import { FormSubmission } from "@/types/form";
import { SpouseVisibilityProvider } from "@/contexts/SpouseVisibilityContext";
import FormContent from "./form/FormContent";

interface FormContainerProps {
  editingSubmission?: FormSubmission | null;
  onUpdate?: (submission: FormSubmission) => void;
}

const FormContainer = (props: FormContainerProps) => {
  return (
    <SpouseVisibilityProvider>
      <FormContent {...props} />
    </SpouseVisibilityProvider>
  );
};

export default FormContainer;