interface MetricDisplayProps {
  metric: string;
  value: number;
}

const MetricDisplay = ({ metric, value }: MetricDisplayProps) => {
  const formatMetricValue = (metric: string, value: number) => {
    if (metric === 'ap') {
      return `$${(value / 100).toFixed(2)}`;
    }
    return value;
  };

  return (
    <div className="text-sm">
      <span className="font-medium capitalize">
        {metric === 'ap' ? 'AP' : metric}:{' '}
      </span>
      <span>{formatMetricValue(metric, value)}</span>
    </div>
  );
};

export default MetricDisplay;