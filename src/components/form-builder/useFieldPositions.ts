import { useState } from "react";
import { DragEndEvent } from "@dnd-kit/core";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { snapToGrid } from "@/utils/gridUtils";

export const useFieldPositions = (section: string) => {
  const [fieldPositions, setFieldPositions] = useState<Record<string, any>>({});
  const { toast } = useToast();

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, delta } = event;
    if (!active) return;

    const fieldId = active.id as string;
    const currentPosition = fieldPositions[fieldId] || {};
    
    const newX = snapToGrid(Math.round((currentPosition.x_position || 0) + delta.x));
    const newY = snapToGrid(Math.round((currentPosition.y_position || 0) + delta.y));

    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        throw new Error("No authenticated user found");
      }

      const { data: existingPosition } = await supabase
        .from('form_field_positions')
        .select('*')
        .eq('user_id', user.data.user.id)
        .eq('field_id', fieldId)
        .eq('section', section)
        .maybeSingle();

      if (existingPosition) {
        const { error: updateError } = await supabase
          .from('form_field_positions')
          .update({
            x_position: newX,
            y_position: newY,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingPosition.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('form_field_positions')
          .insert({
            user_id: user.data.user.id,
            field_id: fieldId,
            section,
            x_position: newX,
            y_position: newY,
          });

        if (insertError) throw insertError;
      }

      setFieldPositions(prev => ({
        ...prev,
        [fieldId]: {
          ...prev[fieldId],
          x_position: newX,
          y_position: newY,
        },
      }));

      toast({
        title: "Success",
        description: "Field position updated",
      });

    } catch (error: any) {
      console.error("Error saving field position:", error);
      toast({
        title: "Error",
        description: "Failed to save field position",
        variant: "destructive",
      });
    }
  };

  const updateFieldProperties = async (updates: {
    width?: string;
    height?: string;
    alignment?: string;
  }) => {
    if (!selectedField) return;

    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        throw new Error("No authenticated user found");
      }

      const { data: existingPosition } = await supabase
        .from('form_field_positions')
        .select('*')
        .eq('user_id', user.data.user.id)
        .eq('field_id', selectedField)
        .eq('section', section)
        .maybeSingle();

      if (existingPosition) {
        const { error: updateError } = await supabase
          .from('form_field_positions')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingPosition.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('form_field_positions')
          .insert({
            user_id: user.data.user.id,
            field_id: selectedField,
            section,
            position: fields.findIndex(f => f.id === selectedField),
            ...updates,
          });

        if (insertError) throw insertError;
      }

      setFieldPositions(prev => ({
        ...prev,
        [selectedField]: {
          ...prev[selectedField],
          ...updates,
        },
      }));

    } catch (error: any) {
      console.error("Error saving field properties:", error);
      toast({
        title: "Error",
        description: "Failed to save field properties",
        variant: "destructive",
      });
    }
  };

  return {
    fieldPositions,
    setFieldPositions,
    handleDragEnd,
    updateFieldProperties,
  };
};
