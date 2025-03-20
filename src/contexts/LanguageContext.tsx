
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from "@/integrations/supabase/client";

type Language = 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  translate: (key: string) => string;
  toggleLanguage: () => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    try {
      // Try to get saved language preference
      const savedLanguage = localStorage.getItem('language') as Language;
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'es')) {
        setLanguage(savedLanguage);
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    }
    
    // Also check Supabase for the user's language preference
    const loadUserLanguage = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('language_preference')
            .eq('id', user.id)
            .single();

          if (!error && profile?.language_preference) {
            setLanguage(profile.language_preference as Language);
          }
        }
      } catch (error) {
        console.error('Error loading user language preference:', error);
      }
    };
    
    loadUserLanguage();
  }, []);

  const saveLanguage = (lang: Language) => {
    try {
      localStorage.setItem('language', lang);
      setLanguage(lang);
    } catch (error) {
      console.error('Error saving language preference:', error);
      setLanguage(lang); // Still update state even if storage fails
    }
  };

  // Implement toggleLanguage to switch between languages
  const toggleLanguage = async (): Promise<void> => {
    try {
      const newLanguage = language === 'en' ? 'es' : 'en';
      
      // Update local state first for better UX
      saveLanguage(newLanguage);
      
      // Update language preference in Supabase if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({
            language_preference: newLanguage
          })
          .eq('id', user.id);
        
        if (error) {
          console.error('Error updating language preference in database:', error);
        }
      }
    } catch (error) {
      console.error('Error toggling language:', error);
    }
  };

  // Simple translation function - can be expanded later
  const translate = (key: string): string => {
    // For now, just return the key as we don't have translation data
    return key;
  };

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage: saveLanguage, 
      translate,
      toggleLanguage 
    }}>
      {children}
    </LanguageContext.Provider>
  );
};
