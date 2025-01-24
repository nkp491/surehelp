import BusinessMetrics from "@/components/BusinessMetrics";
import AssessmentFormSection from "@/components/dashboard/AssessmentFormSection";

const Assessment = () => {
  return (
    <div className="relative min-h-screen">
      {/* Reduced height fixed header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b shadow-md">
        <BusinessMetrics />
      </div>
      
      {/* Reduced top padding */}
      <div className="pt-[200px]">
        <div className="container mx-auto py-4">
          <AssessmentFormSection 
            isFormOpen={true}
            setIsFormOpen={() => {}}
          />
        </div>
      </div>
    </div>
  );
};

export default Assessment;