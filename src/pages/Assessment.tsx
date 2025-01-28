import AssessmentFormSection from "@/components/dashboard/AssessmentFormSection";

const Assessment = () => {
  return (
    <div className="relative min-h-screen w-full">
      <div className="w-full max-w-[95vw] mx-auto px-0">
        <AssessmentFormSection 
          isFormOpen={true}
          setIsFormOpen={() => {}}
        />
      </div>
    </div>
  );
};

export default Assessment;