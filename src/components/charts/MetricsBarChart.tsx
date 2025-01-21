import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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
    { key: 'ap', label: 'AP', color: colors[6] },
  ];

  const handleBarClick = (data: any, metric: string) => {
    toast({
      title: `${metric} Details`,
      description: `Value: ${data[metric]} on ${data.name}`,
    });
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip 
          formatter={(value: number, name: string) => {
            return name === 'AP' ? `$${value.toFixed(2)}` : value;
          }}
        />
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
      </BarChart>
    </ResponsiveContainer>
  );
};

export default MetricsBarChart;