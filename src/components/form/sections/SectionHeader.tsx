import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/translations";

interface SectionHeaderProps {
  section: string;
}

const SectionHeader = ({ section }: SectionHeaderProps) => {
  const { language } = useLanguage();
  const t = translations[language];

  const getTranslatedSection = (section: string) => {
    const sectionKey = section.toLowerCase().replace(/\s+/g, '');
    return (t as any)[sectionKey] || section;
  };

  return (
    <div className="bg-[#00A3E0] text-white px-1.5 py-0.5 text-xs font-medium">
      {getTranslatedSection(section)}
    </div>
  );
};

export default SectionHeader;