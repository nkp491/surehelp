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
  console.log(`[MetricCard] Rendering ${metric} with value:`, value);

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
      }).format(value / 100);
    }
    return value.toString();
  };

  const isAP = metric === 'ap';

  const getTrendIcon = () => {
    if (trend > 0) {
      return <TrendingUp className="h-5 w-5 text-green-500" />;
    } else if (trend < 0) {
      return <TrendingDown className="h-5 w-5 text-red-500" />;
    }
    return <Minus className="h-5 w-5 text-gray-400" />;
  };

  const getTrendText = () => {
    const absValue = Math.abs(trend);
    if (trend === 0) return "No change";
    return `${trend > 0 ? 'Up' : 'Down'} ${absValue}% from previous period`;
  };

  return (
    <Card className={`p-6 transition-all duration-200 hover:shadow-lg ${
      isAP ? 'bg-gradient-to-br from-[#9b87f5] to-[#7E69AB] text-white' : 'bg-white'
    }`}>
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
          <h3 className={`font-semibold text-lg ${isAP ? 'text-white text-xl' : 'text-gray-700'}`}>
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
        <div className={`text-2xl font-bold ${
          isAP ? 'text-white' : 'text-gray-900'
        }`}>
          {formatValue(value)}
        </div>
      </div>
    </Card>
  );
};

export default MetricCard;