import { useState } from "react";
import { FormSubmission } from "@/types/form";

export const useSubmissionsTable = (submissions: FormSubmission[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ status: [], dateRange: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof FormSubmission;
    direction: 'asc' | 'desc';
  } | null>(null);

  const ITEMS_PER_PAGE = 10;

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

      const comparison = String(aValue).localeCompare(String(bValue));
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  };

  const filterSubmissions = (submissions: FormSubmission[]) => {
    return submissions.filter((submission) => {
      const matchesSearch = submission.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filters.status.length === 0 || filters.status.includes(submission.outcome?.toLowerCase() || "");
      return matchesSearch && matchesStatus;
    });
  };

  const paginateSubmissions = (submissions: FormSubmission[]) => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return submissions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  const processSubmissions = (submissions: FormSubmission[]) => {
    const filtered = filterSubmissions(submissions);
    const sorted = sortSubmissions(filtered);
    return paginateSubmissions(sorted);
  };

  const totalPages = Math.ceil(submissions.length / ITEMS_PER_PAGE);

  return {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    currentPage,
    setCurrentPage,
    sortConfig,
    handleSort,
    processSubmissions,
    totalPages,
    ITEMS_PER_PAGE
  };
};