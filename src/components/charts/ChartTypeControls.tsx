import { Button } from "@/components/ui/button";
import { BarChart3, LineChart, PieChart } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ChartTypeControlsProps {
  chartType: "bar" | "line" | "pie";
  onChartTypeChange: (type: "bar" | "line" | "pie") => void;
}

const ChartTypeControls = ({ chartType, onChartTypeChange }: ChartTypeControlsProps) => {
  const { toast } = useToast();

  const chartControls = [
    {
      type: "bar" as const,
      label: "Bar Chart",
      icon: BarChart3,
      description: "Compare metrics across different time periods"
    },
    {
      type: "line" as const,
      label: "Line Chart",
      icon: LineChart,
      description: "View trends and patterns over time"
    },
    {
      type: "pie" as const,
      label: "Pie Chart",
      icon: PieChart,
      description: "See the distribution of metrics"
    }
  ];

  const handleChartChange = (type: "bar" | "line" | "pie") => {
    onChartTypeChange(type);
    const control = chartControls.find(c => c.type === type);
    if (control) {
      toast({
        title: `Switched to ${control.label}`,
        description: control.description,
      });
    }
  };

  return (
    <div className="flex gap-3">
      {chartControls.map(({ type, label, icon: Icon, description }) => (
        <Button
          key={type}
          variant={chartType === type ? "default" : "outline"}
          onClick={() => handleChartChange(type)}
          className="flex items-center gap-2 min-w-[120px] justify-center transition-all hover:scale-105"
        >
          <Icon className="h-4 w-4" />
          <span className="hidden sm:inline">{label}</span>
        </Button>
      ))}
    </div>
  );
};

export default ChartTypeControls;