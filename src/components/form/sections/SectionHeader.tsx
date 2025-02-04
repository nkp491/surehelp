import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/translations";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface SectionHeaderProps {
  section: string;
  onRemove?: () => void;
}

const SectionHeader = ({ section, onRemove }: SectionHeaderProps) => {
  const { language } = useLanguage();
  const t = translations[language];

  const getTranslatedSection = (section: string) => {
    const sectionKey = section.toLowerCase().replace(/\s+/g, '');
    return (t as any)[sectionKey] || section;
  };

  return (
    <div className="bg-[#3B97CB] text-white px-4 py-2 text-base font-medium flex justify-between items-center rounded-t">
      <span>{getTranslatedSection(section)}</span>
      {onRemove && (
        <Button
          onClick={onRemove}
          variant="ghost"
          size="sm"
          className="h-4 w-4 p-0 hover:bg-blue-600"
        >
          <X className="h-3 w-3 text-white" />
        </Button>
      )}
    </div>
  );
};

export default SectionHeader;