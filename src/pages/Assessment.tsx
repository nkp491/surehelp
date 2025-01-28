import AssessmentFormSection from "@/components/dashboard/AssessmentFormSection";
import MetricsSection from "@/components/dashboard/MetricsSection";

const Assessment = () => {
  return (
    <div className="relative min-h-screen w-full">
      <MetricsSection />
      <div className="w-full py-2">
        <AssessmentFormSection 
          isFormOpen={true}
          setIsFormOpen={() => {}}
        />
      </div>
    </div>
  );
};

export default Assessment;