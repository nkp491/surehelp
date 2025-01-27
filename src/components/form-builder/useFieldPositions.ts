import { useState, useEffect } from "react";
import { DragEndEvent } from "@dnd-kit/core";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { snapToGrid } from "@/utils/gridUtils";
import { FormField } from "@/types/formTypes";

interface UseFieldPositionsProps {
  section: string;
  fields: FormField[];
  selectedField: string | null;
}

export const useFieldPositions = ({ section, fields, selectedField }: UseFieldPositionsProps) => {
  const [fieldPositions, setFieldPositions] = useState<Record<string, any>>({});
  const { toast } = useToast();

  // Load saved positions whenever the component mounts or section changes
  useEffect(() => {
    const loadSavedPositions = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log("No authenticated user found");
          return;
        }

        const { data: savedPositions, error } = await supabase
          .from('form_field_positions')
          .select('*')
          .eq('user_id', user.id)
          .eq('section', section);

        if (error) {
          throw error;
        }

        if (savedPositions && savedPositions.length > 0) {
          const positionsMap = savedPositions.reduce((acc, pos) => ({
            ...acc,
            [pos.field_id]: {
              x_position: pos.x_position,
              y_position: pos.y_position,
              width: pos.width,
              height: pos.height,
              alignment: pos.alignment,
            }
          }), {});
          
          setFieldPositions(positionsMap);
          console.log("Loaded positions:", positionsMap);
        }
      } catch (error) {
        console.error("Error loading field positions:", error);
        toast({
          title: "Error",
          description: "Failed to load saved field positions",
          variant: "destructive",
        });
      }
    };

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        loadSavedPositions();
      } else if (event === 'SIGNED_OUT') {
        setFieldPositions({});
      }
    });

    // Initial load
    loadSavedPositions();

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [section, toast]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, delta } = event;
    if (!active) return;

    const fieldId = active.id as string;
    const currentPosition = fieldPositions[fieldId] || {};
    
    const newX = snapToGrid(Math.round((currentPosition.x_position || 0) + delta.x));
    const newY = snapToGrid(Math.round((currentPosition.y_position || 0) + delta.y));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("No authenticated user found");
      }

      // Update local state immediately for better UX
      setFieldPositions(prev => ({
        ...prev,
        [fieldId]: {
          ...prev[fieldId],
          x_position: newX,
          y_position: newY,
        },
      }));

      const { data: existingPosition } = await supabase
        .from('form_field_positions')
        .select('*')
        .eq('user_id', user.id)
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
            user_id: user.id,
            field_id: fieldId,
            section,
            position: fields.findIndex(f => f.id === fieldId),
            x_position: newX,
            y_position: newY,
          });

        if (insertError) throw insertError;
      }

      console.log("Saved position for field:", fieldId, { newX, newY });

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