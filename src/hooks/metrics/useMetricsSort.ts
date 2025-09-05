import { useState } from 'react';
import { MetricCount } from '@/types/metrics';

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
};

export const useMetricsSort = (history: Array<{ date: string; created_at: string; metrics: MetricCount }>) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'created_at', direction: 'desc' });

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
    } else if (sortConfig.key === 'created_at') {
      const comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
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