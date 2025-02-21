
import React from 'react';
import AgentMetricsDisplay from './agent/AgentMetricsDisplay';

interface AgentMetric {
  key: string;
  metric: string;
  value: number;
  isCurrency?: boolean;
  trend?: {
    value: number;
    isGood: boolean;
  };
}

const AgentPerformance: React.FC = () => {
  const metrics: AgentMetric[] = [
    {
      key: "leads",
      metric: "Total Leads",
      value: 150,
      trend: {
        value: 12,
        isGood: true
      }
    },
    {
      key: "conversion",
      metric: "Conversion Rate",
      value: 35,
      trend: {
        value: 5,
        isGood: true
      }
    },
    {
      key: "revenue",
      metric: "Monthly Revenue",
      value: 25000,
      isCurrency: true,
      trend: {
        value: 8,
        isGood: true
      }
    }
  ];

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Performance Metrics</h2>
      <AgentMetricsDisplay metrics={metrics} />
    </div>
  );
};

export default AgentPerformance;
