import BusinessMetrics from "@/components/BusinessMetrics";
import AssessmentFormSection from "@/components/dashboard/AssessmentFormSection";

const Assessment = () => {
  return (
    <div className="h-screen flex flex-col">
      {/* Sticky KPI Tracker */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <BusinessMetrics />
      </div>
      
      {/* Scrollable Assessment Form */}
      <div className="flex-1 overflow-y-auto">
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