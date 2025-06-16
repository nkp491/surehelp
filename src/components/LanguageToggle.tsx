// This component is now only used in the Profile page
import { useLanguage } from "@/contexts/LanguageContext";

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return null; // Component no longer renders anything
}