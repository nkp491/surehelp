import { useState } from "react";
import { FormSubmission } from "@/types/form";
import { isWithinInterval, parseISO } from "date-fns";

export const useSubmissionsTable = (submissions: FormSubmission[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: [] as string[],
    dateRange: {
      from: undefined as Date | undefined,
      to: undefined as Date | undefined
    },
    leadType: [] as string[],
    premium: {
      min: undefined as number | undefined,
      max: undefined as number | undefined
    }
  });
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

  const filterSubmissions = (submissions: FormSubmission[]) => {
    return submissions.filter((submission) => {
      // Search filter
      const matchesSearch = Object.values(submission).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );

      // Status filter
      const matchesStatus = filters.status.length === 0 || 
        filters.status.includes(submission.outcome?.toLowerCase() || "");

      // Lead type filter
      const matchesLeadType = filters.leadType.length === 0 ||
        filters.leadType.includes(submission.leadType?.toLowerCase() || "");

      // Date range filter
      let matchesDateRange = true;
      if (filters.dateRange.from && filters.dateRange.to && submission.timestamp) {
        const submissionDate = parseISO(submission.timestamp);
        matchesDateRange = isWithinInterval(submissionDate, {
          start: filters.dateRange.from,
          end: filters.dateRange.to
        });
      }

      // Premium filter
      let matchesPremium = true;
      if (submission.premium) {
        const premiumValue = parseFloat(submission.premium);
        if (filters.premium.min !== undefined) {
          matchesPremium = matchesPremium && premiumValue >= filters.premium.min;
        }
        if (filters.premium.max !== undefined) {
          matchesPremium = matchesPremium && premiumValue <= filters.premium.max;
        }
      }

      return matchesSearch && matchesStatus && matchesLeadType && 
             matchesDateRange && matchesPremium;
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