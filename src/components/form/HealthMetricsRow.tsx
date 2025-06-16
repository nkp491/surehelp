import DraggableFormField from "../DraggableFormField";

interface HealthMetricsRowProps {
  formData: any;
  setFormData: (value: any) => void;
  errors: any;
  submissionId?: string;
}

const HealthMetricsRow = ({ formData, setFormData, errors, submissionId }: HealthMetricsRowProps) => {
  const healthMetrics = [
    { id: 'height', type: 'height', label: 'Height' },
    { id: 'weight', type: 'text', label: 'Weight' },
    { id: 'tobaccoUse', type: 'tobaccoUse', label: 'Tobacco Use' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {healthMetrics.map((field) => (
        <DraggableFormField
          key={field.id}
          id={field.id}
          fieldType={field.type}
          label={field.label}
          value={formData[field.id]}
          onChange={(value) =>
            setFormData((prev: any) => ({ ...prev, [field.id]: value }))
          }
          error={errors[field.id]}
          submissionId={submissionId}
        />
      ))}
    </div>
  );
};

export default HealthMetricsRow;