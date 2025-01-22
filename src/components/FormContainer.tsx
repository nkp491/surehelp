import { FormSubmission } from "@/types/form";
import { MetricsProvider } from "@/contexts/MetricsContext";
import { FamilyMembersProvider } from "@/contexts/FamilyMembersContext";
import FormContent from "@/components/form/FormContent";
import MetricsSection from "@/components/dashboard/MetricsSection";

interface FormContainerProps {
  editingSubmission?: FormSubmission | null;
  onUpdate?: (submission: FormSubmission) => void;
}

const FormContainer = ({ editingSubmission, onUpdate }: FormContainerProps) => {
  return (
    <MetricsProvider>
      <FamilyMembersProvider>
        <div className="space-y-4">
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-2">
            <MetricsSection />
          </div>
          <FormContent editingSubmission={editingSubmission} onUpdate={onUpdate} />
        </div>
      </FamilyMembersProvider>
    </MetricsProvider>
  );
};

export default FormContainer;