import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useLoadFieldPositions = (section: string) => {
  const [fieldPositions, setFieldPositions] = useState<Record<string, any>>({});
  const { toast } = useToast();

  useEffect(() => {
    const loadSavedPositions = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          return;
        }

        const { data: savedPositions, error } = await supabase
          .from("form_field_positions")
          .select("*")
          .eq("user_id", user.id)
          .eq("section", section)
          .order("position");

        if (error) {
          throw error;
        }

        if (savedPositions && savedPositions.length > 0) {
          const positionsMap = savedPositions.reduce(
            (acc, pos) => ({
              ...acc,
              [pos.field_id]: {
                x_position: pos.x_position,
                y_position: pos.y_position,
                width: pos.width,
                height: pos.height,
                alignment: pos.alignment,
                position: pos.position,
              },
            }),
            {}
          );
          setFieldPositions(positionsMap);
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

    loadSavedPositions();
  }, [section, toast]);

  return { fieldPositions, setFieldPositions };
};
