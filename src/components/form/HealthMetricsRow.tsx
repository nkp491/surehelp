import DraggableFormField from "../DraggableFormField";

interface HealthMetricsRowProps {
  formData: any;
  setFormData: (value: any) => void;
  errors: any;
  submissionId?: string;
}

const HealthMetricsRow = ({ formData, setFormData, errors, submissionId }: HealthMetricsRowProps) => {
  return (
    <div className="flex items-center gap-2">
      <div className="w-[120px]">
        <DraggableFormField
          id="height"
          fieldType="height"
          label="Height"
          value={formData.height}
          onChange={(value) =>
            setFormData((prev: any) => ({ ...prev, height: value }))
          }
          error={errors.height}
          submissionId={submissionId}
        />
      </div>
      <div className="w-[100px]">
        <DraggableFormField
          id="weight"
          fieldType="text"
          label="Weight"
          value={formData.weight}
          onChange={(value) =>
            setFormData((prev: any) => ({ ...prev, weight: value }))
          }
          error={errors.weight}
          submissionId={submissionId}
          placeholder="lbs"
        />
      </div>
      <div className="flex-1 max-w-[200px]">
        <DraggableFormField
          id="tobaccoUse"
          fieldType="tobaccoUse"
          label="Tobacco Use"
          value={formData.tobaccoUse}
          onChange={(value) =>
            setFormData((prev: any) => ({ ...prev, tobaccoUse: value }))
          }
          error={errors.tobaccoUse}
          submissionId={submissionId}
        />
      </div>
    </div>
  );
};

export default HealthMetricsRow;