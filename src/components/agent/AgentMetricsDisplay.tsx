import MetricCard from "../metrics/MetricCard";
import RatioCard from "../metrics/RatioCard";
import MetricsChart from "../MetricsChart";
import { AgentMetrics } from "@/types/agent";

interface AgentMetricsDisplayProps {
  metrics: AgentMetrics;
  ratios: { label: string; value: string | number }[];
  chartData: { name: string; value: number }[];
}

const AgentMetricsDisplay = ({ metrics, ratios }: AgentMetricsDisplayProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
        {Object.entries(metrics).map(([metric, value]) => (
          <MetricCard
            key={metric}
            metric={metric}
            value={value}
            inputValue={value.toString()}
            onInputChange={() => {}}
            isCurrency={metric === 'ap'}
            trend={10}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {ratios.slice(0, 8).map((ratio, index) => (
          <RatioCard
            key={index}
            label={ratio.label}
            value={ratio.value}
          />
        ))}
      </div>

      <MetricsChart 
        timePeriod="24h"
        onTimePeriodChange={() => {}}
      />
    </div>
  );
};

export default AgentMetricsDisplay;