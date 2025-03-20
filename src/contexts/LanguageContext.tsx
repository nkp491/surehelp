
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  translate: (key: string) => string;
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

  // Simple translation function - can be expanded later
  const translate = (key: string): string => {
    // For now, just return the key as we don't have translation data
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: saveLanguage, translate }}>
      {children}
    </LanguageContext.Provider>
  );
};
