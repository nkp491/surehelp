import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { FormSection } from "@/types/formTypes";

interface FormPositionLoaderProps {
  sections: FormSection[];
  setSections: (sections: FormSection[]) => void;
}

const FormPositionLoader = ({ sections, setSections }: FormPositionLoaderProps) => {
  useEffect(() => {
    loadPositions();
  }, []);

  const loadPositions = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Load field positions
      const { data: fieldPositions, error: fieldError } = await supabase
        .from('form_field_positions')
        .select('*')
        .order('position');

      if (fieldError) throw fieldError;

      // Load section positions
      const { data: sectionPositions, error: sectionError } = await supabase
        .from('form_section_positions')
        .select('*')
        .order('position');

      if (sectionError) throw sectionError;

      if (fieldPositions && fieldPositions.length > 0) {
        const positionMap = new Map(fieldPositions.map(p => [p.field_id, p]));
        
        // Update sections with saved field positions
        let updatedSections = sections.map(section => ({
          ...section,
          fields: section.fields.sort((a, b) => {
            const posA = positionMap.get(a.id)?.position ?? 0;
            const posB = positionMap.get(b.id)?.position ?? 0;
            return posA - posB;
          })
        }));

        // Apply section ordering if available
        if (sectionPositions && sectionPositions.length > 0) {
          const sectionMap = new Map(sectionPositions.map(p => [p.section_name, p]));
          updatedSections = updatedSections.sort((a, b) => {
            const posA = sectionMap.get(a.section)?.position ?? 0;
            const posB = sectionMap.get(b.section)?.position ?? 0;
            return posA - posB;
          });
        }

        setSections(updatedSections);
      }
    } catch (error) {
      console.error('Error loading positions:', error);
      toast({
        title: "Error",
        description: "Failed to load saved positions",
        variant: "destructive",
      });
    }
  };

  return null;
};

export default FormPositionLoader;