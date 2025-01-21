import { useState } from "react";
import { Card } from "@/components/ui/card";
import ChartControls from "./charts/ChartControls";
import MetricsBarChart from "./charts/MetricsBarChart";
import MetricsLineChart from "./charts/MetricsLineChart";
import MetricsPieChart from "./charts/MetricsPieChart";
import { useMetricsHistory } from "@/hooks/useMetricsHistory";

const COLORS = ['#4CAF50', '#2196F3', '#FFC107', '#FF5722', '#9C27B0', '#795548'];
const AP_COLOR = '#E5DEFF'; // Soft purple for AP

interface MetricsChartProps {
  timePeriod: '24h' | '7d' | '30d' | 'custom';
  onTimePeriodChange: (period: '24h' | '7d' | '30d' | 'custom') => void;
}

const MetricsChart = ({ timePeriod, onTimePeriodChange }: MetricsChartProps) => {
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');
  const { sortedHistory } = useMetricsHistory();

  // Transform historical data into metrics dataset
  const transformedMetricsData = sortedHistory.map(entry => ({
    name: new Date(entry.date).toLocaleDateString(),
    leads: entry.metrics.leads || 0,
    calls: entry.metrics.calls || 0,
    contacts: entry.metrics.contacts || 0,
    scheduled: entry.metrics.scheduled || 0,
    sits: entry.metrics.sits || 0,
    sales: entry.metrics.sales || 0,
  }));

  // Transform AP data separately for the line chart
  const transformedAPData = sortedHistory.map(entry => ({
    name: new Date(entry.date).toLocaleDateString(),
    ap: (entry.metrics.ap || 0) / 100, // Convert cents to dollars
  }));

  return (
    <Card className="p-6 border-[#FFFCF6] bg-[#FFFCF6]">
      <ChartControls
        timePeriod={timePeriod}
        chartType={chartType}
        onTimePeriodChange={onTimePeriodChange}
        onChartTypeChange={setChartType}
      />

      <div className="h-[400px] mt-4">
        {chartType === 'bar' ? (
          <MetricsBarChart 
            data={transformedMetricsData} 
            colors={COLORS}
            apData={transformedAPData}
            apColor={AP_COLOR}
          />
        ) : chartType === 'line' ? (
          <MetricsLineChart 
            data={transformedMetricsData}
            colors={COLORS}
          />
        ) : (
          <MetricsPieChart 
            data={transformedMetricsData} 
            colors={COLORS} 
          />
        )}
      </div>
    </Card>
  );
};

export default MetricsChart;