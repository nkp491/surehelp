import { useState } from "react";
import { Card } from "@/components/ui/card";
import ChartControls from "./charts/ChartControls";
import MetricsBarChart from "./charts/MetricsBarChart";
import MetricsLineChart from "./charts/MetricsLineChart";
import MetricsPieChart from "./charts/MetricsPieChart";
import { useMetricsHistory } from "@/hooks/useMetricsHistory";

const COLORS = ['#4CAF50', '#2196F3', '#FFC107', '#FF5722', '#9C27B0', '#795548'];

interface MetricsChartProps {
  data: { name: string; value: number }[];
  timePeriod: '24h' | '7d' | '30d' | 'custom';
  onTimePeriodChange: (period: '24h' | '7d' | '30d' | 'custom') => void;
}

const MetricsChart = ({ timePeriod, onTimePeriodChange }: MetricsChartProps) => {
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');
  const { sortedHistory } = useMetricsHistory();

  // Transform historical data into the format expected by charts
  const transformedData = sortedHistory.map(entry => ({
    name: new Date(entry.date).toLocaleDateString(),
    value: entry.leads || 0, // You can modify this to show different metrics
  }));

  return (
    <Card className="p-6 border-[#FFFCF6] bg-[#FFFCF6]">
      <ChartControls
        timePeriod={timePeriod}
        chartType={chartType}
        onTimePeriodChange={onTimePeriodChange}
        onChartTypeChange={setChartType}
      />

      <div className="h-[400px]">
        {chartType === 'bar' ? (
          <MetricsBarChart data={transformedData} colors={COLORS} />
        ) : chartType === 'line' ? (
          <MetricsLineChart data={transformedData} />
        ) : (
          <MetricsPieChart data={transformedData} colors={COLORS} />
        )}
      </div>
    </Card>
  );
};

export default MetricsChart;