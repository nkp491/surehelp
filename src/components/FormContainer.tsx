import { FormSubmission } from "@/types/form";
import { SpouseVisibilityProvider } from "@/contexts/SpouseVisibilityContext";
import { MetricsProvider } from "@/contexts/MetricsContext";
import FormContent from "@/components/form/FormContent";

interface FormContainerProps {
  editingSubmission?: FormSubmission | null;
  onUpdate?: (submission: FormSubmission) => void;
}

const FormContainer = ({ editingSubmission, onUpdate }: FormContainerProps) => {
  return (
    <MetricsProvider>
      <SpouseVisibilityProvider>
        <FormContent editingSubmission={editingSubmission} onUpdate={onUpdate} />
      </SpouseVisibilityProvider>
    </MetricsProvider>
  );
};

export default FormContainer;