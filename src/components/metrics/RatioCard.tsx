
import { Card } from "@/components/ui/card";

interface RatioCardProps {
  label: string;
  value: string | number;
}

const RatioCard = ({ label, value }: RatioCardProps) => {
  return (
    <Card className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-center shadow-sm hover:shadow-md transition-shadow">
      <div className="text-xl font-bold text-primary">
        {value}
      </div>
      <div className="text-xs text-muted-foreground mt-1">
        {label}
      </div>
    </Card>
  );
};

export default RatioCard;
