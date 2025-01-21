import { Card } from "@/components/ui/card";
import ChartControls from "./charts/ChartControls";
import { useMetricsHistory } from "@/hooks/useMetricsHistory";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line } from 'recharts';
import CustomTooltip from "./charts/CustomTooltip";

const COLORS = ['#4CAF50', '#2196F3', '#FFC107', '#FF5722', '#9C27B0', '#795548'];
const AP_COLOR = '#E5DEFF'; // Soft purple for AP

interface MetricsChartProps {
  timePeriod: '24h' | '7d' | '30d' | 'custom';
  onTimePeriodChange: (period: '24h' | '7d' | '30d' | 'custom') => void;
}

const MetricsChart = ({ timePeriod, onTimePeriodChange }: MetricsChartProps) => {
  const { sortedHistory } = useMetricsHistory();

  // Transform historical data into a single dataset including AP
  const transformedMetricsData = sortedHistory.map(entry => ({
    name: new Date(entry.date).toLocaleDateString(),
    leads: entry.metrics.leads || 0,
    calls: entry.metrics.calls || 0,
    contacts: entry.metrics.contacts || 0,
    scheduled: entry.metrics.scheduled || 0,
    sits: entry.metrics.sits || 0,
    sales: entry.metrics.sales || 0,
    ap: (entry.metrics.ap || 0) / 100, // Convert cents to dollars
  }));

  const metrics = [
    { key: 'leads', label: 'Leads', color: COLORS[0] },
    { key: 'calls', label: 'Calls', color: COLORS[1] },
    { key: 'contacts', label: 'Contacts', color: COLORS[2] },
    { key: 'scheduled', label: 'Scheduled', color: COLORS[3] },
    { key: 'sits', label: 'Sits', color: COLORS[4] },
    { key: 'sales', label: 'Sales', color: COLORS[5] },
  ];

  // Calculate the maximum AP value for the right Y-axis
  const maxAP = Math.max(...transformedMetricsData.map(item => item.ap));
  const yAxisDomain = [0, Math.ceil(maxAP / 1000) * 1000];

  return (
    <Card className="p-6 border-[#FFFCF6] bg-[#FFFCF6]">
      <ChartControls
        timePeriod={timePeriod}
        onTimePeriodChange={onTimePeriodChange}
      />

      <div className="h-[500px] mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={transformedMetricsData} margin={{ top: 20, right: 50, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis 
              yAxisId="metrics"
              orientation="left"
            />
            <YAxis 
              yAxisId="ap"
              orientation="right"
              domain={yAxisDomain}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {metrics.map(({ key, label, color }) => (
              <Bar 
                key={key}
                yAxisId="metrics"
                dataKey={key}
                name={label}
                stackId="a"
                fill={color}
              />
            ))}
            <Line
              type="monotone"
              dataKey="ap"
              yAxisId="ap"
              name="AP"
              stroke={AP_COLOR}
              strokeWidth={2}
              dot={{ fill: AP_COLOR, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default MetricsChart;