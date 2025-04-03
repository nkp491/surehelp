
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetch manager details from the database
 */
export const fetchManagerDetails = async (
  managerId: string | null | undefined,
  setManagerName: (name: string) => void,
  setManagerEmail: (email: string) => void
): Promise<void> => {
  if (!managerId) {
    setManagerName('');
    setManagerEmail('');
    return;
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('first_name, last_name, email')
      .eq('id', managerId)
      .single();

    if (error) throw error;
    
    if (data) {
      setManagerName(`${data.first_name || ''} ${data.last_name || ''}`.trim());
      setManagerEmail(data.email || '');
    }
  } catch (error) {
    console.error("Error fetching manager details:", error);
  }
};
