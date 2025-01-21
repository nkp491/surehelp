import React from "react";
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
import { FormSection } from "@/types/formTypes";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DragContextProps {
  children: React.ReactNode;
  sections: FormSection[];
  setSections: (sections: FormSection[]) => void;
}

const DragContext = ({ children, sections, setSections }: DragContextProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const saveSectionPosition = async (sectionName: string, position: number) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No authenticated user');
      }

      const { error } = await supabase
        .from('form_section_positions')
        .upsert({
          user_id: session.user.id,
          section_name: sectionName,
          position: position
        }, {
          onConflict: 'user_id,section_name'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving section position:', error);
      toast({
        title: "Error",
        description: "Failed to save section position",
        variant: "destructive",
      });
    }
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const isSection = active.id.startsWith('section-');
      
      if (isSection) {
        const oldIndex = sections.findIndex(s => `section-${s.section}` === active.id);
        const newIndex = sections.findIndex(s => `section-${s.section}` === over.id);
        
        const newSections = arrayMove(sections, oldIndex, newIndex);
        setSections(newSections);

        // Save new section positions
        newSections.forEach((section, index) => {
          saveSectionPosition(section.section, index);
        });
      } else {
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

        // Save new field position
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
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={[
          ...sections.map(section => `section-${section.section}`),
          ...sections.flatMap(section => section.fields.map(field => field.id))
        ]}
        strategy={verticalListSortingStrategy}
      >
        {children}
      </SortableContext>
    </DndContext>
  );
};

export default DragContext;