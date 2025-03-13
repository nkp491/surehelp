
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

type Language = 'en' | 'es';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [isInitialized, setIsInitialized] = useState(false);

  // Load user's language preference on mount
  useEffect(() => {
    const loadLanguagePreference = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('language_preference')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error("Error loading language preference:", error);
            return;
          }

          if (profile?.language_preference) {
            setLanguage(profile.language_preference as Language);
          }
        }
      } catch (error) {
        console.error("Error loading language preference:", error);
      } finally {
        setIsInitialized(true);
      }
    };

    loadLanguagePreference();
  }, []);

  const toggleLanguage = () => {
    setLanguage((prev) => {
      const newLanguage = prev === 'en' ? 'es' : 'en';
      
      // Dispatch custom event to notify other components about language change
      window.dispatchEvent(new CustomEvent('languageChange', { 
        detail: { language: newLanguage } 
      }));
      
      return newLanguage;
    });
  };

  // Listen for language change events
  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      if (event.detail?.language) {
        setLanguage(event.detail.language);
      }
    };

    window.addEventListener('languageChange', handleLanguageChange as EventListener);
    return () => window.removeEventListener('languageChange', handleLanguageChange as EventListener);
  }, []);

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
