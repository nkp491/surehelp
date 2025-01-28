import React from "react";
import { INITIAL_FIELDS } from "./FormFields";
import { useFormLogic } from "@/hooks/useFormLogic";
import FormButtons from "./FormButtons";
import { FormSubmission } from "@/types/form";
import { useFieldPositions } from "@/components/form-builder/useFieldPositions";
import DragDropArea from "../form-builder/DragDropArea";
import { useFormBuilder } from "@/contexts/FormBuilderContext";
import { useSpouseVisibility } from "@/contexts/SpouseVisibilityContext";
import { useFamilyMembers } from "@/contexts/FamilyMembersContext";
import FormSection from "@/components/FormSection";

interface FormContentProps {
  editingSubmission?: FormSubmission | null;
  onUpdate?: (submission: FormSubmission) => void;
}

const FormContent = ({ editingSubmission, onUpdate }: FormContentProps) => {
  const [sections] = React.useState(INITIAL_FIELDS);
  const { formData, setFormData, errors, handleSubmit } = useFormLogic(editingSubmission, onUpdate);
  const { selectedField, setSelectedField } = useFormBuilder();
  const { showSpouse } = useSpouseVisibility();
  const { familyMembers } = useFamilyMembers();

  const filteredFields = sections.reduce((acc, section) => {
    const sectionFields = section.fields.filter(field => {
      const isSpouseField = field.id.toLowerCase().includes('spouse');
      return showSpouse ? true : !isSpouseField;
    });
    return [...acc, ...sectionFields];
  }, []);

  const { fieldPositions, handleDragEnd } = useFieldPositions({
    section: "Combined Form",
    fields: filteredFields,
    selectedField
  });

  const handleFormSubmit = (e: React.MouseEvent<HTMLButtonElement>, outcome: string) => {
    e.preventDefault();
    handleSubmit(e, outcome);
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="w-full h-full flex flex-col">
      <div className="flex-1 min-h-0">
        <DragDropArea
          fields={filteredFields}
          fieldPositions={fieldPositions}
          formData={formData}
          setFormData={setFormData}
          selectedField={selectedField}
          setSelectedField={setSelectedField}
        />
      </div>
      
      {familyMembers.map((member, index) => (
        <FormSection
          key={member.id}
          section={`Family Member ${index + 1}`}
          fields={sections[0].fields.filter(field => !field.id.toLowerCase().includes('spouse'))}
          formData={member.data}
          setFormData={(data) => {
            const updatedMembers = [...familyMembers];
            updatedMembers[index] = { ...member, data };
          }}
          errors={{}}
          submissionId={member.id}
        />
      ))}
      
      <FormButtons onSubmit={handleFormSubmit} />
    </form>
  );
};

export default FormContent;