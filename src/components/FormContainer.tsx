import FormContent from "@/components/form/FormContent";
import MetricsSection from "@/components/dashboard/MetricsSection";

const FormContainer = () => {
  return (
    <div className="space-y-8">
      <MetricsSection />
      <FormContent />
    </div>
  );
};

export default FormContainer;