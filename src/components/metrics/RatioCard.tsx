import { Card } from "@/components/ui/card";

interface RatioCardProps {
  label: string;
  value: string | number;
}

const RatioCard = ({ label, value }: RatioCardProps) => {
  return (
    <Card className="p-6 bg-[#FFFCF6] hover:shadow-lg transition-all duration-200">
      <div className="flex flex-col items-center gap-3">
        <h3 className="font-semibold text-lg text-gray-700 text-center">{label}</h3>
        <span className="text-2xl font-bold text-primary">{value}</span>
      </div>
    </Card>
  );
};

export default RatioCard;