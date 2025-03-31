import { useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import { INITIAL_FIELDS } from "@/components/form/FormFields";

export const useDragAndDrop = () => {
  const [sections, setSections] = useState(INITIAL_FIELDS);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const allFields = sections.flatMap(section => section.fields);
      const newFields = arrayMove(
        allFields,
        allFields.findIndex(item => item.id === active.id),
        allFields.findIndex(item => item.id === over.id)
      );
      
      const newSections = sections.map(section => ({
        ...section,
        fields: newFields.filter(field => 
          section.fields.some(originalField => originalField.id === field.id)
        )
      }));
      
      setSections(newSections);
    }
  };

  return {
    sections,
    handleDragEnd
  };
};