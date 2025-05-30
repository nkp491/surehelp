import { FormField } from "@/types/formTypes";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/translations";
import DraggableFormField from "../../DraggableFormField";

interface AgentSectionProps {
  fields: FormField[];
  formData: any;
  setFormData: (value: any) => void;
  errors: any;
  submissionId?: string;
}

const AgentSection = ({
  fields,
  formData,
  setFormData,
  errors,
  submissionId,
}: AgentSectionProps) => {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="mt-2">
      <div className="bg-[#00A3E0] text-white px-1.5 py-0.5 text-xs font-medium mb-0.5">
        {t.agentUseOnly}
      </div>
      <div className="form-container">
        {fields.map((field) => (
          <DraggableFormField
            key={field.id}
            id={field.id}
            fieldType={field.type}
            label={field.label}
            value={formData[field.id]}
            onChange={(value) => setFormData((prev: any) => ({ ...prev, [field.id]: value }))}
            placeholder={field.placeholder}
            required={field.required}
            error={errors[field.id]}
            submissionId={submissionId}
          />
        ))}
      </div>
    </div>
  );
};

export default AgentSection;
