import { Card } from "@/components/ui/card";
import DailyReportHeader from "./DailyReportHeader";
import MetricDisplay from "./MetricDisplay";

interface DailyMetrics {
  leads: number;
  calls: number;
  contacts: number;
  scheduled: number;
  sits: number;
  sales: number;
  ap: number;
}

interface DailyReportCardProps {
  date: string;
  metrics: DailyMetrics;
}

const DailyReportCard = ({ date, metrics }: DailyReportCardProps) => {
  return (
    <Card className="p-4">
      <div className="space-y-2">
        <DailyReportHeader date={date} />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
          {Object.entries(metrics).map(([metric, value]) => (
            <MetricDisplay key={metric} metric={metric} value={value} />
          ))}
        </div>
      </div>
    </Card>
  );
};

export default DailyReportCard;