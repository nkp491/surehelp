import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line } from 'recharts';
import { useToast } from "@/components/ui/use-toast";
import CustomTooltip from './CustomTooltip';

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
}

const MetricsBarChart = ({ data, colors }: MetricsBarChartProps) => {
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

  // Calculate the maximum AP value for the right Y-axis
  const maxAP = Math.max(...data.map(item => item.ap / 100));
  const yAxisDomain = [0, Math.ceil(maxAP / 1000) * 1000];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 50, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis yAxisId="left" />
        <YAxis 
          yAxisId="right" 
          orientation="right" 
          domain={yAxisDomain}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        {metrics.map(({ key, label, color }) => (
          <Bar 
            key={key}
            dataKey={key}
            name={label}
            stackId="a"
            fill={color}
            onClick={(data) => handleBarClick(data, key)}
          />
        ))}
        <Line
          type="monotone"
          dataKey="ap"
          yAxisId="right"
          name="AP"
          stroke="#E5DEFF"
          strokeWidth={2}
          dot={{ fill: '#E5DEFF', r: 4 }}
          activeDot={{ r: 6 }}
          // Convert AP from cents to dollars
          data={data.map(item => ({
            ...item,
            ap: item.ap / 100
          }))}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default MetricsBarChart;