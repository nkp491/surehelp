import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FormField } from "@/types/formTypes";

export const useSaveFieldPosition = (section: string, fields: FormField[]) => {
  const { toast } = useToast();

  const savePosition = async (
    fieldId: string,
    newX: number,
    newY: number,
    setFieldPositions: (value: any) => void
  ) => {
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

  return { savePosition };
};