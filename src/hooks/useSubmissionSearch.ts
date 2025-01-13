import { useState } from "react";
import { FormSubmission } from "@/types/form";

export const useSubmissionSearch = (submissions: FormSubmission[]) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filterBySearch = (submissions: FormSubmission[]) => {
    if (!searchTerm) return submissions;
    
    return submissions.filter((submission) =>
      Object.values(submission).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  };

  return {
    searchTerm,
    setSearchTerm,
    filterBySearch,
  };
};