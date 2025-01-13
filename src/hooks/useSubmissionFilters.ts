import { useState } from "react";
import { FormSubmission } from "@/types/form";
import { isWithinInterval, parseISO } from "date-fns";

interface FilterState {
  status: string[];
  dateRange: {
    from?: Date;
    to?: Date;
  };
  leadType: string[];
  premium: {
    min?: number;
    max?: number;
  };
}

export const useSubmissionFilters = (submissions: FormSubmission[]) => {
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    dateRange: {
      from: undefined,
      to: undefined
    },
    leadType: [],
    premium: {
      min: undefined,
      max: undefined
    }
  });

  const applyFilters = (submissions: FormSubmission[]) => {
    return submissions.filter((submission) => {
      // Status filter
      const matchesStatus = filters.status.length === 0 || 
        filters.status.includes(submission.outcome?.toLowerCase() || "");

      // Lead type filter
      const matchesLeadType = filters.leadType.length === 0 ||
        filters.leadType.includes(submission.leadType || "");

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

      return matchesStatus && matchesLeadType && matchesDateRange && matchesPremium;
    });
  };

  return {
    filters,
    setFilters,
    applyFilters,
  };
};