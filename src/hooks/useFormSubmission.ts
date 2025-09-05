import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { FormSubmission } from "@/types/form";
import { useAuditTrail } from "./useAuditTrail";
import { useState } from "react";

export const useFormSubmission = (
  formData: Omit<FormSubmission, "timestamp" | "outcome">,
  setFormData: (data: Omit<FormSubmission, "timestamp" | "outcome">) => void,
  initialFormValues: Omit<FormSubmission, "timestamp" | "outcome">,
  editingSubmission: FormSubmission | null,
  onUpdate?: (submission: FormSubmission) => void
) => {
  const { toast } = useToast();
  const { createAuditEntry } = useAuditTrail();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (e: React.FormEvent, outcome: string) => {
    e.preventDefault();
    if (isSubmitting) {
      console.warn(
        "Submission already in progress, ignoring duplicate request"
      );
      return false;
    }
    setIsSubmitting(true);
    try {
      const hasValidData = Object.values(formData).some((value) => {
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === "string") return value.trim().length > 0;
        return value !== null && value !== undefined;
      });
      if (!hasValidData) {
        console.warn("Form data appears to be empty or corrupted:", formData);
        toast({
          title: "Error",
          description:
            "Form data is empty. Please fill out the form before submitting.",
          variant: "destructive",
        });
        return false;
      }
      const submissionId =
        editingSubmission?.timestamp || new Date().toISOString();
      const submissionData = {
        ...formData,
        outcome,
        timestamp: submissionId,
      };
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error("No authenticated user found");
      if (editingSubmission) {
        const auditEntry = createAuditEntry(
          editingSubmission,
          submissionData,
          "updated"
        );
        const auditTrail = [
          ...(editingSubmission.auditTrail || []),
          auditEntry,
        ];
        const { error } = await supabase
          .from("submissions")
          .update({
            data: JSON.stringify({
              ...submissionData,
              auditTrail,
            }),
            outcome: submissionData.outcome,
          })
          .eq("timestamp", editingSubmission.timestamp);
        if (error) throw error;
        onUpdate?.(submissionData);
        toast({
          title: "Success!",
          description: "Your form has been updated successfully.",
        });
      } else {
        const { data: existingSubmission, error: checkError } = await supabase
          .from("submissions")
          .select("id")
          .eq("timestamp", submissionId)
          .eq("user_id", user.data.user.id)
          .maybeSingle();
        if (checkError) {
          console.error("Error checking for existing submission:", checkError);
        }
        if (existingSubmission) {
          console.warn("Duplicate submission detected, skipping insert");
          toast({
            title: "Warning",
            description: "This submission already exists. Please try again.",
            variant: "destructive",
          });
          return false;
        }
        const auditEntry = createAuditEntry({}, submissionData, "created");
        const auditTrail = [auditEntry];
        const { error } = await supabase.from("submissions").insert({
          user_id: user.data.user.id,
          data: JSON.stringify({
            ...submissionData,
            auditTrail,
          }),
          outcome: submissionData.outcome,
          timestamp: submissionData.timestamp,
        });
        if (error) {
          console.error("Error inserting submission:", error);
          throw error;
        }
        toast({
          title: "Success!",
          description: `Form submitted with outcome: ${outcome}`,
        });
      }
      toast({
        title: "Form Submitted Successfully!",
        description: "Preparing to reset form...",
        duration: 2000,
      });
      setTimeout(() => {
        const formElement = document.querySelector("form");
        if (formElement) {
          formElement.style.transition = "opacity 0.3s ease-out";
          formElement.style.opacity = "0";
          setTimeout(() => {
            setFormData(initialFormValues);
            formElement.style.opacity = "1";
            formElement.style.transition = "opacity 0.3s ease-in";
          }, 300);
        } else {
          setFormData(initialFormValues);
        }
      }, 800);
      return true;
    } catch (error) {
      console.error("Error saving submission:", error);
      toast({
        title: "Error",
        description: "Failed to save submission. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { handleSubmit };
};
