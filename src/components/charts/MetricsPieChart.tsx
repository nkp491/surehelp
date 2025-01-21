import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useToast } from "@/components/ui/use-toast";

interface MetricsPieChartProps {
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

const MetricsPieChart = ({ data, colors }: MetricsPieChartProps) => {
  const { toast } = useToast();

  // Calculate totals for each metric
  const totals = data.reduce((acc, curr) => ({
    leads: acc.leads + curr.leads,
    calls: acc.calls + curr.calls,
    contacts: acc.contacts + curr.contacts,
    scheduled: acc.scheduled + curr.scheduled,
    sits: acc.sits + curr.sits,
    sales: acc.sales + curr.sales,
    ap: acc.ap + curr.ap,
  }), {
    leads: 0,
    calls: 0,
    contacts: 0,
    scheduled: 0,
    sits: 0,
    sales: 0,
    ap: 0,
  });

  const pieData = [
    { name: 'Leads', value: totals.leads },
    { name: 'Calls', value: totals.calls },
    { name: 'Contacts', value: totals.contacts },
    { name: 'Scheduled', value: totals.scheduled },
    { name: 'Sits', value: totals.sits },
    { name: 'Sales', value: totals.sales },
    { name: 'AP', value: totals.ap },
  ];

  const handlePieClick = (data: any) => {
    toast({
      title: `${data.name} Total`,
      description: `Total ${data.name}: ${data.value}`,
    });
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={pieData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          onClick={handlePieClick}
        >
          {pieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: number, name: string) => {
            return name === 'AP' ? [`$${value.toFixed(2)}`, name] : [value, name];
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default MetricsPieChart;