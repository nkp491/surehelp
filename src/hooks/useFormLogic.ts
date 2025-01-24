import { useEffect } from "react";
import { FormSubmission } from "@/types/form";
import { useAgeCalculation } from "./useAgeCalculation";
import { useIncomeCalculation } from "./useIncomeCalculation";
import { useFormValidation } from "./useFormValidation";
import { useFormState } from "./useFormState";
import { useFormSubmission } from "./useFormSubmission";
import { toast } from "@/hooks/use-toast";

export const useFormLogic = (
  editingSubmission: FormSubmission | null = null,
  onUpdate?: (submission: FormSubmission) => void
) => {
  const {
    formData,
    setFormData,
    errors,
    setErrors,
    initialFormValues
  } = useFormState(editingSubmission);

  const { age } = useAgeCalculation(formData.dob, "");
  const { totalIncome } = useIncomeCalculation(formData);
  const { validateForm } = useFormValidation();

  const { handleSubmit: submitForm } = useFormSubmission(
    formData,
    setFormData,
    initialFormValues,
    editingSubmission,
    onUpdate
  );

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      age,
      totalIncome,
    }));
  }, [age, totalIncome, setFormData]);

  const handleSubmit = async (e: React.MouseEvent | React.FormEvent, outcome: string) => {
    const validationErrors = validateForm(formData);
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length === 0) {
      await submitForm(e, outcome);
    } else {
      toast({
        title: "Error",
        description: "Please check the form for errors.",
        variant: "destructive",
      });
    }
  };

  return {
    formData,
    setFormData,
    errors,
    handleSubmit,
  };
};