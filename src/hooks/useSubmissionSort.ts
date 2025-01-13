import { useState } from "react";
import { FormSubmission } from "@/types/form";

interface SortConfig {
  key: keyof FormSubmission;
  direction: 'asc' | 'desc';
}

export const useSubmissionSort = () => {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  const handleSort = (key: keyof FormSubmission) => {
    setSortConfig((currentSort) => {
      if (currentSort?.key === key) {
        return {
          key,
          direction: currentSort.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      return { key, direction: 'asc' };
    });
  };

  const sortSubmissions = (submissions: FormSubmission[]) => {
    if (!sortConfig) return submissions;

    return [...submissions].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === undefined || bValue === undefined) return 0;

      if (sortConfig.key === 'timestamp') {
        const dateA = new Date(aValue as string).getTime();
        const dateB = new Date(bValue as string).getTime();
        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
      }

      const comparison = String(aValue).localeCompare(String(bValue));
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  };

  return {
    sortConfig,
    handleSort,
    sortSubmissions,
  };
};