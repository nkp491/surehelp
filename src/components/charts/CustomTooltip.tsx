import { TooltipProps } from 'recharts';

const formatTooltipValue = (value: number, name: string) => {
  if (name === 'AP') {
    return `$${value.toFixed(2)}`;
  }
  return value;
};

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
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

export default CustomTooltip;