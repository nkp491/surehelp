
export type Language = 'en' | 'es';

export interface LanguageContextType {
  language: Language;
  toggleLanguage: () => Promise<void>;
}
