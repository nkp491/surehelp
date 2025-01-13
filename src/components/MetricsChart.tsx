import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { BarChart, LineChart, PieChart, Cell, Bar, Line, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ['#4CAF50', '#2196F3', '#FFC107', '#FF5722', '#9C27B0', '#795548'];

interface MetricsChartProps {
  data: { name: string; value: number }[];
  timePeriod: '24h' | '7d' | '30d' | 'custom';
  onTimePeriodChange: (period: '24h' | '7d' | '30d' | 'custom') => void;
}

const formatTooltipValue = (value: number, name: string) => {
  if (name === 'Ap') {
    return `$${value.toFixed(2)}`;
  }
  return value;
};

const MetricsChart = ({ data, timePeriod, onTimePeriodChange }: MetricsChartProps) => {
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow">
          <p className="font-semibold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatTooltipValue(entry.value, entry.name)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center mb-6">
        <h2 className="text-2xl font-bold">Metrics Visualization</h2>
        <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
          <RadioGroup
            value={timePeriod}
            onValueChange={(value) => onTimePeriodChange(value as '24h' | '7d' | '30d' | 'custom')}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="24h" id="24h" />
              <Label htmlFor="24h">24 Hours</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="7d" id="7d" />
              <Label htmlFor="7d">7 Days</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="30d" id="30d" />
              <Label htmlFor="30d">30 Days</Label>
            </div>
          </RadioGroup>
          <div className="space-x-2">
            <Button
              variant={chartType === 'bar' ? 'default' : 'outline'}
              onClick={() => setChartType('bar')}
            >
              Bar Chart
            </Button>
            <Button
              variant={chartType === 'line' ? 'default' : 'outline'}
              onClick={() => setChartType('line')}
            >
              Line Chart
            </Button>
            <Button
              variant={chartType === 'pie' ? 'default' : 'outline'}
              onClick={() => setChartType('pie')}
            >
              Pie Chart
            </Button>
          </div>
        </div>
      </div>

      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => (data.find(d => d.value === value)?.name === 'Ap' ? `$${value.toFixed(2)}` : value)} />
              <Tooltip content={<CustomTooltip />} />
              <Legend layout="vertical" verticalAlign="middle" align="right" />
              <Bar dataKey="value" fill="#8884d8">
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          ) : chartType === 'line' ? (
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => (data.find(d => d.value === value)?.name === 'Ap' ? `$${value.toFixed(2)}` : value)} />
              <Tooltip content={<CustomTooltip />} />
              <Legend layout="vertical" verticalAlign="middle" align="right" />
              <Line type="monotone" dataKey="value" stroke="#8884d8" />
            </LineChart>
          ) : (
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} ${name === 'Ap' ? `$${value.toFixed(2)}` : value}`}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend layout="vertical" verticalAlign="middle" align="right" />
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default MetricsChart;