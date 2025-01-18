import { useState } from 'react';
import { MetricCount } from '@/types/metrics';

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
};

export const useMetricsSort = (history: Array<{ date: string; metrics: MetricCount }>) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'desc' });

  const handleSort = (key: string) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedHistory = [...history].sort((a, b) => {
    if (sortConfig.key === 'date') {
      const comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    } else {
      const aValue = a.metrics[sortConfig.key as keyof MetricCount];
      const bValue = b.metrics[sortConfig.key as keyof MetricCount];
      const comparison = aValue - bValue;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    }
  });

  return {
    sortedHistory,
    handleSort,
  };
};