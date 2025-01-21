import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MetricsLineChartProps {
  data: Array<any>;
  colors: string[];
  isCurrency?: boolean;
}

const MetricsLineChart = ({ data, colors, isCurrency = false }: MetricsLineChartProps) => {
  // Add null check for data
  if (!data || !data[0]) {
    return <div>No data available</div>;
  }

  const metrics = Object.keys(data[0]).filter(key => key !== 'name');

  const formatYAxis = (value: any): string => {
    if (isCurrency) {
      return `$${Number(value).toFixed(2)}`;
    }
    return String(value);
  };

  const formatTooltip = (value: any): string => {
    if (isCurrency) {
      return `$${Number(value).toFixed(2)}`;
    }
    return String(value);
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={formatYAxis} />
        <Tooltip formatter={formatTooltip} />
        <Legend />
        {metrics.map((metric, index) => (
          <Line
            key={metric}
            type="monotone"
            dataKey={metric}
            stroke={colors[index % colors.length]}
            activeDot={{ r: 8 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default MetricsLineChart;