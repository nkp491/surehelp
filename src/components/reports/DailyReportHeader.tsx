import { Card } from "@/components/ui/card";
import { format } from "date-fns";

interface DailyReportHeaderProps {
  date: string;
}

const DailyReportHeader = ({ date }: DailyReportHeaderProps) => {
  return (
    <h3 className="font-semibold text-lg">
      Report for {format(new Date(date), "MMMM d, yyyy")}
    </h3>
  );
};

export default DailyReportHeader;