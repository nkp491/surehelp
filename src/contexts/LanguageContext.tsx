
import React, { createContext, useContext } from 'react';
import { useLanguagePreference } from '@/hooks/useLanguagePreference';
import { useLanguageToggle } from '@/hooks/useLanguageToggle';
import type { LanguageContextType } from '@/types/language';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { language, setLanguage, isLoading } = useLanguagePreference();
  const { toggleLanguage } = useLanguageToggle(language, setLanguage);

  // Don't render children until initial language preference is loaded
  if (isLoading) {
    return null; // Or a loading spinner if preferred
  }

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
