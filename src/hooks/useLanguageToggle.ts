
import { supabase } from "@/integrations/supabase/client";
import { type Language } from '@/types/language';

export const useLanguageToggle = (language: Language, setLanguage: (lang: Language) => void) => {
  const toggleLanguage = async () => {
    const newLanguage = language === 'en' ? 'es' : 'en';
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No user found');
        return;
      }

      // Update the language state immediately for better UX
      setLanguage(newLanguage);

      // Then update the database - only update language_preference
      const { error } = await supabase
        .from('profiles')
        .update({
          language_preference: newLanguage
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating language preference:', error);
        // We won't revert the state anymore since the UI change should persist
        // even if the database update fails
      }
    } catch (error) {
      console.error('Error in toggleLanguage:', error);
      // We won't revert the state here either
    }
  };

  return { toggleLanguage };
};
