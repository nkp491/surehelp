import { Card } from "@/components/ui/card";

interface RatioCardProps {
  label: string;
  value: string | number;
}

const RatioCard = ({ label, value }: RatioCardProps) => {
  return (
    <Card className="p-2 bg-gray-100 rounded-lg text-center shadow-sm">
      <div className="text-sm font-semibold text-gray-900">
        {value}
      </div>
      <div className="text-xs text-muted-foreground">
        {label}
      </div>
    </Card>
  );
};

export default RatioCard;