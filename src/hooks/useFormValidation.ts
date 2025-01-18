import { FormSubmission } from "@/types/form";

export const useFormValidation = () => {
  const validateForm = (formData: Partial<FormSubmission>) => {
    const errors: Partial<FormSubmission> = {};
    
    if (!formData.name) {
      errors.name = "Primary applicant name is required";
    }
    if (!formData.dob) {
      errors.dob = "Primary applicant date of birth is required";
    }
    
    // Only validate spouse fields if spouse name is provided
    if (formData.spouseName && !formData.spouseDob) {
      errors.spouseDob = "Spouse date of birth is required if adding spouse";
    }
    
    return errors;
  };

  return { validateForm };
};