
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

type Language = 'en' | 'es';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  // Load user's language preference on mount
  useEffect(() => {
    const loadLanguagePreference = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('language_preference')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error("Error fetching language preference:", error);
          return;
        }

        if (profile?.language_preference) {
          setLanguage(profile.language_preference as Language);
        }
      } catch (error) {
        console.error("Error loading language preference:", error);
      }
    };

    loadLanguagePreference();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadLanguagePreference();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
