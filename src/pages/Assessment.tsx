import BusinessMetrics from "@/components/BusinessMetrics";
import AssessmentFormSection from "@/components/dashboard/AssessmentFormSection";

const Assessment = () => {
  return (
    <div className="relative min-h-screen">
      {/* Fixed KPI Tracker */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b shadow-md">
        <BusinessMetrics />
      </div>
      
      {/* Scrollable Assessment Form - with top padding to account for fixed header */}
      <div className="pt-[600px]"> {/* Increased padding to account for BusinessMetrics height */}
        <div className="container mx-auto py-8">
          <AssessmentFormSection 
            isFormOpen={true}
            setIsFormOpen={() => {}} // Form will always be open in this view
          />
        </div>
      </div>
    </div>
  );
};

export default Assessment;