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

  // Transform historical data into two separate datasets
  const transformedMetricsData = sortedHistory.map(entry => ({
    name: new Date(entry.date).toLocaleDateString(),
    leads: entry.metrics.leads || 0,
    calls: entry.metrics.calls || 0,
    contacts: entry.metrics.contacts || 0,
    scheduled: entry.metrics.scheduled || 0,
    sits: entry.metrics.sits || 0,
    sales: entry.metrics.sales || 0,
  }));

  const transformedAPData = sortedHistory.map(entry => ({
    name: new Date(entry.date).toLocaleDateString(),
    ap: entry.metrics.ap || 0,
  }));

  return (
    <Card className="p-6 border-[#FFFCF6] bg-[#FFFCF6]">
      <ChartControls
        timePeriod={timePeriod}
        chartType={chartType}
        onTimePeriodChange={onTimePeriodChange}
        onChartTypeChange={setChartType}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-4">
        <div className="lg:col-span-3 h-[400px]">
          {chartType === 'bar' ? (
            <MetricsBarChart 
              data={transformedMetricsData} 
              colors={COLORS} 
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
        <div className="h-[400px]">
          <Card className="h-full p-4 bg-white">
            <h3 className="text-lg font-semibold mb-4 text-[#2A6F97]">Average Premium (AP)</h3>
            <div className="h-[calc(100%-2rem)]">
              <MetricsLineChart 
                data={transformedAPData.map(d => ({
                  name: d.name,
                  value: d.ap / 100, // Convert cents to dollars
                }))}
                colors={[AP_COLOR]}
                isCurrency
              />
            </div>
          </Card>
        </div>
      </div>
    </Card>
  );
};

export default MetricsChart;