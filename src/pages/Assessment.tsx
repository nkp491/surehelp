import { useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import BusinessMetrics from "@/components/BusinessMetrics";
import AssessmentFormSection from "@/components/dashboard/AssessmentFormSection";

const Assessment = () => {
  const [isFormOpen, setIsFormOpen] = useState(true);
  const session = useSession();

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg font-medium">Loading...</div>
      </div>
    );
  }

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