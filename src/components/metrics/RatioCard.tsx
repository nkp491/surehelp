import { Card } from "@/components/ui/card";

interface RatioCardProps {
  label: string;
  value: string | number;
}

const RatioCard = ({ label, value }: RatioCardProps) => {
  return (
    <Card className="overflow-hidden">
      <div className="bg-[#3F7BA9] p-2 text-white">
        <h3 className="font-medium text-sm text-center">{label}</h3>
      </div>
      <div className="bg-[#F5F5F5] p-4 flex items-center justify-center">
        <span className="text-2xl font-bold text-[#2A2A2A]">{value}</span>
      </div>
    </Card>
  );
};

export default RatioCard;