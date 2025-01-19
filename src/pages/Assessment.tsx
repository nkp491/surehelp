import BusinessMetrics from "@/components/BusinessMetrics";
import AssessmentFormSection from "@/components/dashboard/AssessmentFormSection";

const Assessment = () => {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Business Metrics</h1>
        <p className="text-gray-600">Track and manage your key performance indicators</p>
      </div>
      
      <BusinessMetrics />
      
      <div className="mt-12 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Client Assessment</h1>
        <p className="text-gray-600">Complete the assessment form for your client</p>
      </div>
      
      <AssessmentFormSection 
        isFormOpen={true}
        setIsFormOpen={() => {}} // Form will always be open in this view
      />
    </div>
  );
};

export default Assessment;