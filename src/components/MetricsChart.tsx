import { useState } from "react";
import { Card } from "@/components/ui/card";
import ChartControls from "./charts/ChartControls";
import MetricsBarChart from "./charts/MetricsBarChart";
import MetricsLineChart from "./charts/MetricsLineChart";
import MetricsPieChart from "./charts/MetricsPieChart";

const COLORS = ['#4CAF50', '#2196F3', '#FFC107', '#FF5722', '#9C27B0', '#795548'];

interface MetricsChartProps {
  data: { name: string; value: number }[];
  timePeriod: '24h' | '7d' | '30d' | 'custom';
  onTimePeriodChange: (period: '24h' | '7d' | '30d' | 'custom') => void;
}

const MetricsChart = ({ data, timePeriod, onTimePeriodChange }: MetricsChartProps) => {
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');

  return (
    <Card className="p-6 border-[#FFF9EE]">
      <ChartControls
        timePeriod={timePeriod}
        chartType={chartType}
        onTimePeriodChange={onTimePeriodChange}
        onChartTypeChange={setChartType}
      />

      <div className="h-[400px]">
        {chartType === 'bar' ? (
          <MetricsBarChart data={data} colors={COLORS} />
        ) : chartType === 'line' ? (
          <MetricsLineChart data={data} />
        ) : (
          <MetricsPieChart data={data} colors={COLORS} />
        )}
      </div>
    </Card>
  );
};

export default MetricsChart;