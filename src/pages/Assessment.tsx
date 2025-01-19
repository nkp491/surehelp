import { useState } from "react";
import BusinessMetrics from "@/components/BusinessMetrics";
import AssessmentFormSection from "@/components/dashboard/AssessmentFormSection";

const Assessment = () => {
  const [isFormOpen, setIsFormOpen] = useState(true);

  return (
    <div className="container mx-auto py-8 space-y-8">
      <BusinessMetrics />
      <AssessmentFormSection 
        isFormOpen={isFormOpen}
        setIsFormOpen={setIsFormOpen}
      />
    </div>
  );
};

export default Assessment;