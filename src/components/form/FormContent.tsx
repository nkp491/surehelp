import React, { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { FormSubmission } from "@/types/form";
import { INITIAL_FIELDS } from "./FormFields";
import { useFormLogic } from "@/hooks/useFormLogic";
import FormButtons from "./FormButtons";
import FormSection from "./FormSection";
import { useSpouseVisibility } from "@/contexts/SpouseVisibilityContext";
import SpouseToggle from "./SpouseToggle";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface FormContentProps {
  editingSubmission?: FormSubmission | null;
  onUpdate?: (submission: FormSubmission) => void;
}

const FormContent = ({ editingSubmission = null, onUpdate }: FormContentProps) => {
  const [sections, setSections] = useState(INITIAL_FIELDS);
  const { formData, setFormData, errors, handleSubmit } = useFormLogic(editingSubmission, onUpdate);
  const { showSpouse, setShowSpouse } = useSpouseVisibility();
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadFieldPositions();
  }, []);

  const loadFieldPositions = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: positions, error } = await supabase
        .from('form_field_positions')
        .select('*')
        .order('position');

      if (error) throw error;

      if (positions && positions.length > 0) {
        // Create a map of field positions
        const positionMap = new Map(positions.map(p => [p.field_id, p]));
        
        // Update sections with saved positions
        const updatedSections = sections.map(section => ({
          ...section,
          fields: section.fields.sort((a, b) => {
            const posA = positionMap.get(a.id)?.position ?? 0;
            const posB = positionMap.get(b.id)?.position ?? 0;
            return posA - posB;
          })
        }));

        setSections(updatedSections);
      }
    } catch (error) {
      console.error('Error loading field positions:', error);
    }
  };

  const saveFieldPosition = async (fieldId: string, sectionName: string, position: number) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No authenticated user');
      }

      const { error } = await supabase
        .from('form_field_positions')
        .upsert({
          user_id: session.user.id,
          field_id: fieldId,
          section: sectionName,
          position: position
        }, {
          onConflict: 'user_id,field_id'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving field position:', error);
      toast({
        title: "Error",
        description: "Failed to save field position",
        variant: "destructive",
      });
    }
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const allFields = sections.flatMap(section => section.fields);
      const oldIndex = allFields.findIndex(item => item.id === active.id);
      const newIndex = allFields.findIndex(item => item.id === over.id);
      
      const newFields = arrayMove(allFields, oldIndex, newIndex);
      
      const newSections = sections.map(section => ({
        ...section,
        fields: newFields.filter(field => 
          section.fields.some(originalField => originalField.id === field.id)
        )
      }));
      
      setSections(newSections);

      // Save the new position
      const field = allFields.find(f => f.id === active.id);
      if (field) {
        const section = sections.find(s => 
          s.fields.some(f => f.id === active.id)
        );
        if (section) {
          await saveFieldPosition(active.id, section.section, newIndex);
        }
      }
    }
  };

  const handleOutcomeSubmit = (outcome: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    handleSubmit(e as any, outcome);
  };

  const filteredSections = sections.filter(section => {
    if (!showSpouse && (section.section.includes("Spouse"))) {
      return false;
    }
    return true;
  });

  return (
    <form onSubmit={(e) => e.preventDefault()} className="max-w-7xl mx-auto p-6">
      <div className="flex justify-end mb-4">
        <SpouseToggle />
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={filteredSections.flatMap(section => section.fields).map(field => field.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSections.map((section) => (
              <FormSection
                key={section.section}
                section={section.section}
                fields={section.fields}
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                submissionId={editingSubmission?.timestamp}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      
      <FormButtons onSubmit={handleOutcomeSubmit} />
    </form>
  );
};

export default FormContent;