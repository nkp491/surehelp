import { FormSubmission } from "@/types/form";
import { useSubmissionSearch } from "./useSubmissionSearch";
import { useSubmissionFilters } from "./useSubmissionFilters";
import { useSubmissionSort } from "./useSubmissionSort";
import { useSubmissionPagination } from "./useSubmissionPagination";

export const useSubmissionsTable = (submissions: FormSubmission[]) => {
  const { searchTerm, setSearchTerm, filterBySearch } = useSubmissionSearch(submissions);
  const { filters, setFilters, applyFilters } = useSubmissionFilters(submissions);
  const { handleSort, sortSubmissions } = useSubmissionSort();
  const { 
    currentPage, 
    setCurrentPage, 
    paginateSubmissions, 
    getTotalPages,
    itemsPerPage 
  } = useSubmissionPagination();

  const processSubmissions = (submissions: FormSubmission[]) => {
    let processed = filterBySearch(submissions);
    processed = applyFilters(processed);
    processed = sortSubmissions(processed);
    return paginateSubmissions(processed);
  };

  const totalPages = getTotalPages(submissions.length);

  return {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    currentPage,
    setCurrentPage,
    handleSort,
    processSubmissions,
    totalPages,
    itemsPerPage
  };
};