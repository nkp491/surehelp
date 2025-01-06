import { Card } from "@/components/ui/card";

interface RatioCardProps {
  label: string;
  value: string | number;
}

const RatioCard = ({ label, value }: RatioCardProps) => {
  return (
    <Card className="p-4">
      <div className="flex flex-col items-center gap-2">
        <h3 className="font-semibold text-lg text-center">{label}</h3>
        <span className="text-xl font-bold">{value}</span>
      </div>
    </Card>
  );
};

export default RatioCard;