
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { type Language } from '@/types/language';

export const useLanguagePreference = () => {
  const [language, setLanguage] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(true);

  const loadLanguagePreference = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('language_preference')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error("Error fetching language preference:", error);
        setIsLoading(false);
        return;
      }

      if (profile?.language_preference) {
        setLanguage(profile.language_preference as Language);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading language preference:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLanguagePreference();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadLanguagePreference();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { language, setLanguage, isLoading };
};
