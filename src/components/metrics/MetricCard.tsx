import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface MetricCardProps {
  metric: string;
  value: number;
  inputValue: string;
  onInputChange: (value: string) => void;
  isCurrency?: boolean;
  trend?: number;
}

const MetricCard = ({
  metric,
  value,
  isCurrency = false,
  trend = 0,
}: MetricCardProps) => {
  console.log(`[MetricCard] Rendering ${metric} with value:`, {
    action: 'render',
    metric,
    value,
    timestamp: new Date().toISOString()
  });

  const formatMetricName = (metric: string) => {
    return metric === 'ap' ? 'AP' : metric.charAt(0).toUpperCase() + metric.slice(1);
  };

  const formatValue = (value: number) => {
    if (metric === 'ap') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value / 100); // Convert cents to dollars for display
    }
    return value.toString();
  };

  const isAP = metric === 'ap';

  const getTrendIcon = () => {
    if (trend > 0) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (trend < 0) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getTrendText = () => {
    const absValue = Math.abs(trend);
    if (trend === 0) return "No change";
    return `${trend > 0 ? 'Up' : 'Down'} ${absValue}% from previous period`;
  };

  return (
    <Card className={`
      p-4 transition-all duration-200 rounded-lg shadow-sm
      ${isAP 
        ? 'bg-[#3F7BA9] text-white' 
        : 'bg-[#5AA3DC] text-white'}
    `}>
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-lg">
            {formatMetricName(metric)}
          </h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                {getTrendIcon()}
              </TooltipTrigger>
              <TooltipContent>
                <p>{getTrendText()}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="text-3xl font-bold">
          {formatValue(value)}
        </div>
      </div>
    </Card>
  );
};

export default MetricCard;
