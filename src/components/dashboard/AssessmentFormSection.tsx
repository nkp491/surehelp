import { Card } from "@/components/ui/card";
import MetricsSection from "../dashboard/MetricsSection";

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
      <div className="space-y-4">
        <MetricsSection />
      </div>
    </Card>
  );
};

export default AssessmentFormSection;
