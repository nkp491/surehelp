import AssessmentFormSection from "@/components/dashboard/AssessmentFormSection";

const Assessment = () => {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <AssessmentFormSection 
        isFormOpen={true}
        setIsFormOpen={() => {}} // Form will always be open in this view
      />
    </div>
  );
};

export default Assessment;