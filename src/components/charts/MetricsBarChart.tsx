import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line } from 'recharts';
import { useToast } from "@/components/ui/use-toast";

interface MetricsBarChartProps {
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
  colors: string[];
  apData: Array<{
    name: string;
    ap: number;
  }>;
  apColor: string;
}

const MetricsBarChart = ({ data, colors, apColor }: MetricsBarChartProps) => {
  const { toast } = useToast();
  
  const metrics = [
    { key: 'leads', label: 'Leads', color: colors[0] },
    { key: 'calls', label: 'Calls', color: colors[1] },
    { key: 'contacts', label: 'Contacts', color: colors[2] },
    { key: 'scheduled', label: 'Scheduled', color: colors[3] },
    { key: 'sits', label: 'Sits', color: colors[4] },
    { key: 'sales', label: 'Sales', color: colors[5] },
  ];

  const handleBarClick = (data: any, metric: string) => {
    toast({
      title: `${metric} Details`,
      description: `Value: ${data[metric]} on ${data.name}`,
    });
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart 
        data={data} 
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis yAxisId="left" />
        <YAxis 
          yAxisId="right" 
          orientation="right"
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip 
          formatter={(value: any, name: string) => {
            if (name === 'AP') return [`$${value}`, name];
            return [value, name];
          }}
        />
        <Legend />
        {metrics.map(({ key, label, color }) => (
          <Bar 
            key={key}
            dataKey={key}
            name={label}
            fill={color}
            yAxisId="left"
            onClick={(data) => handleBarClick(data, key)}
          />
        ))}
        <Line
          type="monotone"
          dataKey="ap"
          name="AP"
          stroke={apColor}
          yAxisId="right"
          dot={{ fill: apColor }}
          strokeWidth={2}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default MetricsBarChart;