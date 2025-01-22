import BusinessMetrics from "@/components/BusinessMetrics";
import AssessmentFormSection from "@/components/dashboard/AssessmentFormSection";

const Assessment = () => {
  return (
    <div className="h-screen flex flex-col">
      {/* Fixed KPI Tracker */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-background border-b">
        <BusinessMetrics />
      </div>
      
      {/* Scrollable Assessment Form - with top padding to account for fixed header */}
      <div className="flex-1 overflow-y-auto pt-[120px]">
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