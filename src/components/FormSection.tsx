import { FormField } from "@/types/formTypes";
import SectionHeader from "./form/SectionHeader";
import TwoColumnLayout from "./form/TwoColumnLayout";
import { useSpouseVisibility } from "@/contexts/SpouseVisibilityContext";
import DraggableFormField from "./DraggableFormField";
import PrimaryHealth from "./form/PrimaryHealth";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/translations";
import { isAgentField } from "@/utils/fieldCategories";

interface FormSectionProps {
  section: string;
  fields: FormField[];
  formData: any;
  setFormData: (value: any) => void;
  errors: any;
  submissionId?: string;
  onRemove?: () => void;
}

const FormSection = ({ 
  section, 
  fields, 
  formData, 
  setFormData, 
  errors,
  submissionId,
  onRemove
}: FormSectionProps) => {
  const { showSpouse } = useSpouseVisibility();
  const { language } = useLanguage();
  const t = translations[language];
  
  const isSpecialField = (fieldId: string) => {
    return ['height', 'weight', 'tobaccoUse'].includes(fieldId);
  };

  const isSpouseField = (fieldId: string) => {
    return fieldId.toLowerCase().startsWith('spouse');
  };

  const filteredFields = fields.filter(field => {
    if (isSpouseField(field.id)) {
      return showSpouse;
    }
    return true;
  });

  const regularFields = filteredFields.filter(field => !isSpecialField(field.id));
  const nonAgentFields = regularFields.filter(field => !isAgentField(field.id));
  const agentFields = regularFields.filter(field => isAgentField(field.id));

  if (!showSpouse && section.toLowerCase().includes('spouse')) {
    return null;
  }

  if (section === "Primary Health Assessment") {
    return <PrimaryHealth formData={formData} setFormData={setFormData} errors={errors} />;
  }

  const getTranslatedSection = (section: string) => {
    const sectionKey = section.toLowerCase().replace(/\s+/g, '');
    return (t as any)[sectionKey] || section;
  };

  return (
    <div className="bg-white mb-0.5">
      <div className="bg-[#00A3E0] text-white px-1.5 py-0.5 text-sm font-medium">
        {getTranslatedSection(section)}
      </div>
      <div className="p-0.5 space-y-0.5">
        {section === "Assessment Notes" ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
              {nonAgentFields.map((field) => (
                <DraggableFormField
                  key={field.id}
                  id={field.id}
                  fieldType={field.type}
                  label={field.label}
                  value={formData[field.id]}
                  onChange={(value) =>
                    setFormData((prev: any) => ({ ...prev, [field.id]: value }))
                  }
                  placeholder={field.placeholder}
                  required={field.required}
                  error={errors[field.id]}
                  submissionId={submissionId}
                />
              ))}
            </div>
            
            {agentFields.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">{t.agentUseOnly}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                  {agentFields.map((field) => (
                    <DraggableFormField
                      key={field.id}
                      id={field.id}
                      fieldType={field.type}
                      label={field.label}
                      value={formData[field.id]}
                      onChange={(value) =>
                        setFormData((prev: any) => ({ ...prev, [field.id]: value }))
                      }
                      placeholder={field.placeholder}
                      required={field.required}
                      error={errors[field.id]}
                      submissionId={submissionId}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <TwoColumnLayout
            fields={regularFields}
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            submissionId={submissionId}
          />
        )}
      </div>
    </div>
  );
};

export default FormSection;