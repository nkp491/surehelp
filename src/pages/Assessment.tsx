import BusinessMetrics from "@/components/BusinessMetrics";
import AssessmentFormSection from "@/components/dashboard/AssessmentFormSection";
import { useState } from "react";

const Assessment = () => {
  const [isFormOpen, setIsFormOpen] = useState(true);

  return (
    <div className="container mx-auto py-8 space-y-12">
      <BusinessMetrics />
      <AssessmentFormSection 
        isFormOpen={isFormOpen}
        setIsFormOpen={setIsFormOpen}
      />
    </div>
  );
};

export default Assessment;