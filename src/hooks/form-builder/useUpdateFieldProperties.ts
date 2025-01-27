import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FormField } from "@/types/formTypes";

export const useUpdateFieldProperties = (
  section: string,
  fields: FormField[],
  selectedField: string | null
) => {
  const { toast } = useToast();

  const updateProperties = async (
    updates: {
      width?: string;
      height?: string;
      alignment?: string;
    },
    setFieldPositions: (value: any) => void
  ) => {
    if (!selectedField) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("No authenticated user found");
      }

      const { data: existingPosition } = await supabase
        .from('form_field_positions')
        .select('*')
        .eq('user_id', user.id)
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
            user_id: user.id,
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

  return { updateProperties };
};