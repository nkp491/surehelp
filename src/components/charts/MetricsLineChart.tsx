import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import CustomTooltip from './CustomTooltip';

interface MetricsLineChartProps {
  data: Array<{
    name: string;
    leads: number;
    calls: number;
    contacts: number;
    scheduled: number;
    sits: number;
    sales: number;
    ap: number;
  }>;
}

const MetricsLineChart = ({ data }: MetricsLineChartProps) => {
  const metrics = [
    { key: 'leads', color: '#4CAF50', label: 'Leads' },
    { key: 'calls', color: '#2196F3', label: 'Calls' },
    { key: 'contacts', color: '#FFC107', label: 'Contacts' },
    { key: 'scheduled', color: '#FF5722', label: 'Scheduled' },
    { key: 'sits', color: '#9C27B0', label: 'Sits' },
    { key: 'sales', color: '#795548', label: 'Sales' },
    { key: 'ap', color: '#607D8B', label: 'AP' },
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        {metrics.map(({ key, color, label }) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            name={label}
            stroke={color}
            dot={{ fill: color }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default MetricsLineChart;