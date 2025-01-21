import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, TrendingUp, History } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface TimePeriodControlsProps {
  timePeriod: "24h" | "7d" | "30d" | "custom";
  onTimePeriodChange: (period: "24h" | "7d" | "30d" | "custom") => void;
}

const TimePeriodControls = ({ timePeriod, onTimePeriodChange }: TimePeriodControlsProps) => {
  const { toast } = useToast();

  const timeControls = [
    {
      period: "24h" as const,
      label: "Today",
      icon: Clock,
      description: "View today's metrics"
    },
    {
      period: "7d" as const,
      label: "Week",
      icon: TrendingUp,
      description: "View this week's trend"
    },
    {
      period: "30d" as const,
      label: "Month",
      icon: CalendarDays,
      description: "View monthly performance"
    }
  ];

  const handlePeriodChange = (period: "24h" | "7d" | "30d" | "custom") => {
    onTimePeriodChange(period);
    const control = timeControls.find(c => c.period === period);
    if (control) {
      toast({
        title: `Switched to ${control.label} View`,
        description: control.description,
      });
    }
  };

  return (
    <div className="flex gap-3">
      {timeControls.map(({ period, label, icon: Icon }) => (
        <Button
          key={period}
          variant={timePeriod === period ? "default" : "outline"}
          onClick={() => handlePeriodChange(period)}
          className="flex items-center gap-2 min-w-[100px] justify-center transition-all hover:scale-105"
        >
          <Icon className="h-4 w-4" />
          <span>{label}</span>
        </Button>
      ))}
    </div>
  );
};

export default TimePeriodControls;