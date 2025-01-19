import BusinessMetrics from "@/components/BusinessMetrics";
import AssessmentFormSection from "@/components/dashboard/AssessmentFormSection";

const Assessment = () => {
  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Business Metrics Section */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-[#fbfaf8] mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Business Metrics</h2>
          <p className="text-muted-foreground mt-1">Track and analyze your key performance indicators</p>
        </div>
      </div>
      
      <BusinessMetrics />
      
      {/* Client Assessment Section */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-[#fbfaf8] mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Client Assessment</h2>
          <p className="text-muted-foreground mt-1">Complete the assessment form for your client</p>
        </div>
      </div>
      
      <AssessmentFormSection />
    </div>
  );
};

export default Assessment;