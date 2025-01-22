import React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimation,
  DragStartEvent,
  DragEndEvent,
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
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 2, // Reduced distance for easier activation
        delay: 50, // Small delay to prevent accidental drags
        tolerance: 5, // Added tolerance for smoother initiation
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id.toString());
    // Add a visual indication that dragging has started
    document.body.style.cursor = 'grabbing';
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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    // Reset cursor
    document.body.style.cursor = '';

    if (over && active.id !== over.id) {
      const activeIdStr = active.id.toString();
      const overIdStr = over.id.toString();
      const isSection = activeIdStr.startsWith('section-');
      
      if (isSection) {
        const oldIndex = sections.findIndex(s => `section-${s.section}` === activeIdStr);
        const newIndex = sections.findIndex(s => `section-${s.section}` === overIdStr);
        
        if (oldIndex !== -1 && newIndex !== -1) {
          const newSections = arrayMove(sections, oldIndex, newIndex);
          setSections(newSections);
          
          // Show success feedback
          toast({
            title: "Section moved",
            description: "The section has been successfully repositioned",
          });

          // Save new section positions
          newSections.forEach((section, index) => {
            saveSectionPosition(section.section, index);
          });
        }
      } else {
        const allFields = sections.flatMap(section => section.fields);
        const oldIndex = allFields.findIndex(item => item.id === activeIdStr);
        const newIndex = allFields.findIndex(item => item.id === overIdStr);
        
        if (oldIndex !== -1 && newIndex !== -1) {
          const newFields = arrayMove(allFields, oldIndex, newIndex);
          
          const newSections = sections.map(section => ({
            ...section,
            fields: newFields.filter(field => 
              section.fields.some(originalField => originalField.id === field.id)
            )
          }));
          
          setSections(newSections);

          // Save new field position
          const field = allFields.find(f => f.id === activeIdStr);
          if (field) {
            const section = sections.find(s => 
              s.fields.some(f => f.id === activeIdStr)
            );
            if (section) {
              await saveFieldPosition(activeIdStr, section.section, newIndex);
            }
          }
        }
      }
    }
  };

  const dropAnimation = {
    ...defaultDropAnimation,
    dragSourceOpacity: 0.5,
    duration: 200, // Faster animation for smoother feel
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
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
      <DragOverlay dropAnimation={dropAnimation}>
        {activeId ? (
          <div className="bg-white/50 backdrop-blur-sm rounded-lg border border-primary shadow-lg p-4 cursor-grabbing">
            {activeId.startsWith('section-') ? (
              <h2 className="text-xl font-semibold text-gray-900">
                {sections.find(s => `section-${s.section}` === activeId)?.section}
              </h2>
            ) : (
              <div className="h-16 w-full bg-gray-50 rounded animate-pulse" />
            )}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default DragContext;