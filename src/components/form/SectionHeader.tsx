
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface SectionHeaderProps {
  section: string;
  onRemove?: () => void;
}

const SectionHeader = ({ section, onRemove }: SectionHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-2">
      <h2 className="text-lg font-semibold text-gray-900">{section}</h2>
      {onRemove && (
        <Button
          onClick={onRemove}
          className="text-red-600 hover:text-red-700"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default SectionHeader;
