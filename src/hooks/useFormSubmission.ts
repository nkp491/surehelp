import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { FormSubmission } from "@/types/form";
import { useAuditTrail } from "./useAuditTrail";

export const useFormSubmission = (
  formData: Omit<FormSubmission, 'timestamp' | 'outcome'>,
  setFormData: (data: Omit<FormSubmission, 'timestamp' | 'outcome'>) => void,
  initialFormValues: Omit<FormSubmission, 'timestamp' | 'outcome'>,
  editingSubmission: FormSubmission | null,
  onUpdate?: (submission: FormSubmission) => void,
) => {
  const { toast } = useToast();
  const { createAuditEntry } = useAuditTrail();

  const handleSubmit = async (e: React.FormEvent, outcome: string) => {
    e.preventDefault();
    console.log("Submitting form with outcome:", outcome);
    
    const submissionData = {
      ...formData,
      outcome,
      timestamp: editingSubmission?.timestamp || new Date().toISOString()
    };

    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error("No authenticated user found");

      if (editingSubmission) {
        const auditEntry = createAuditEntry(editingSubmission, submissionData, 'updated');
        const auditTrail = [
          ...(editingSubmission.auditTrail || []),
          auditEntry
        ];

        const { error } = await supabase
          .from('submissions')
          .update({
            data: JSON.stringify({
              ...submissionData,
              auditTrail
            }),
            outcome: submissionData.outcome
          })
          .eq('timestamp', editingSubmission.timestamp);

        if (error) throw error;
        
        onUpdate?.(submissionData);
        
        toast({
          title: "Success!",
          description: "Your form has been updated successfully.",
        });
      } else {
        const auditEntry = createAuditEntry({}, submissionData, 'created');
        const auditTrail = [auditEntry];

        const { error } = await supabase
          .from('submissions')
          .insert({
            user_id: user.data.user.id,
            data: JSON.stringify({
              ...submissionData,
              auditTrail
            }),
            outcome: submissionData.outcome,
            timestamp: submissionData.timestamp
          });

        if (error) throw error;
        
        toast({
          title: "Success!",
          description: `Form submitted with outcome: ${outcome}`,
        });
      }
      
      // Add a small delay before resetting to prevent visual break
      setTimeout(() => {
        setFormData(initialFormValues);
      }, 500);
      return true;
    } catch (error) {
      console.error("Error saving submission:", error);
      toast({
        title: "Error",
        description: "Failed to save submission. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  return { handleSubmit };
};