
import React from 'react';

interface MetricCardProps {
  metric: string;
  value: number;
  isCurrency?: boolean;
  trend?: {
    value: number;
    isGood: boolean;
  };
  onInputChange: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({ metric, value, isCurrency = false, trend, onInputChange }) => {
  const formattedValue = isCurrency ? value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  }) : value.toLocaleString();

  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col">
      <div className="text-sm font-medium text-gray-600">{metric}</div>
      <div className="text-2xl font-bold text-gray-900">{formattedValue}</div>
      {trend && (
        <div className={`text-sm mt-2 ${trend.isGood ? 'text-green-500' : 'text-red-500'}`}>
          {trend.isGood ? '▲' : '▼'} {trend.value}%
        </div>
      )}
    </div>
  );
};

interface AgentMetricsDisplayProps {
  metrics: Array<{
    key: string;
    metric: string;
    value: number;
    isCurrency?: boolean;
    trend?: {
      value: number;
      isGood: boolean;
    };
  }>;
}

const AgentMetricsDisplay: React.FC<AgentMetricsDisplayProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {metrics.map((metric) => (
        <MetricCard
          key={metric.key}
          metric={metric.metric}
          value={metric.value}
          isCurrency={metric.isCurrency}
          trend={metric.trend}
          onInputChange={() => {}}
        />
      ))}
    </div>
  );
};

export default AgentMetricsDisplay;
