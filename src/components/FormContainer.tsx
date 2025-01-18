import { FormSubmission } from "@/types/form";
import { SpouseVisibilityProvider } from "@/contexts/SpouseVisibilityContext";
import FormContent from "@/components/form/FormContent";
import MetricsSection from "@/components/dashboard/MetricsSection";

interface FormContainerProps {
  editingSubmission?: FormSubmission | null;
  onUpdate?: (submission: FormSubmission) => void;
}

const FormContainer = ({ editingSubmission, onUpdate }: FormContainerProps) => {
  return (
    <SpouseVisibilityProvider>
      <div className="space-y-8">
        <MetricsSection />
        <FormContent editingSubmission={editingSubmission} onUpdate={onUpdate} />
      </div>
    </SpouseVisibilityProvider>
  );
};

export default FormContainer;