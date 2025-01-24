import DraggableFormField from "../DraggableFormField";

interface HealthMetricsRowProps {
  formData: any;
  setFormData: (value: any) => void;
  errors: any;
  submissionId?: string;
}

const HealthMetricsRow = ({ formData, setFormData, errors, submissionId }: HealthMetricsRowProps) => {
  return (
    <div className="grid grid-cols-3 gap-2">
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
      <DraggableFormField
        id="weight"
        fieldType="text"
        label="Primary Weight"
        value={formData.weight}
        onChange={(value) =>
          setFormData((prev: any) => ({ ...prev, weight: value }))
        }
        error={errors.weight}
        submissionId={submissionId}
        placeholder="lbs"
      />
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
  );
};

export default HealthMetricsRow;