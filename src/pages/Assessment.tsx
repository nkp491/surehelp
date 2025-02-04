import AssessmentFormSection from "@/components/dashboard/AssessmentFormSection";

const Assessment = () => {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      <div className="w-full max-w-[95vw] mx-auto px-0 pt-4">
        <AssessmentFormSection 
          isFormOpen={true}
          setIsFormOpen={() => {}}
        />
      </div>
    </div>
  );
};

export default Assessment;