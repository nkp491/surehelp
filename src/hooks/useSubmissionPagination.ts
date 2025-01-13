import { useState } from "react";

export const useSubmissionPagination = (itemsPerPage: number = 10) => {
  const [currentPage, setCurrentPage] = useState(1);

  const paginateSubmissions = <T>(items: T[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
  };

  const getTotalPages = (totalItems: number) => {
    return Math.ceil(totalItems / itemsPerPage);
  };

  return {
    currentPage,
    setCurrentPage,
    paginateSubmissions,
    getTotalPages,
    itemsPerPage,
  };
};