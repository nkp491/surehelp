import { useState, useEffect } from "react";
import { FormSubmission } from "@/types/form";
import SubmissionsTable from "@/components/SubmissionsTable";
import FormContainer from "@/components/FormContainer";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const SubmittedForms = () => {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [editingSubmission, setEditingSubmission] = useState<FormSubmission | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;

      // Transform the data to match FormSubmission type
      const transformedData = data.map(submission => ({
        ...(JSON.parse(submission.data as string) as Omit<FormSubmission, 'timestamp' | 'outcome'>),
        timestamp: submission.timestamp,
        outcome: submission.outcome
      }));

      setSubmissions(transformedData);
    } catch (error) {
      console.error("Error loading submissions:", error);
      toast({
        title: "Error",
        description: "Failed to load submissions",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (submission: FormSubmission) => {
    setEditingSubmission(submission);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdate = async (updatedSubmission: FormSubmission) => {
    try {
      const { error } = await supabase
        .from('submissions')
        .update({
          data: JSON.stringify({
            ...updatedSubmission,
            timestamp: undefined,
            outcome: undefined
          }),
          outcome: updatedSubmission.outcome
        })
        .eq('timestamp', updatedSubmission.timestamp);

      if (error) throw error;

      loadSubmissions();
      setEditingSubmission(null);
      toast({
        title: "Success",
        description: "Submission updated successfully",
      });
    } catch (error) {
      console.error("Error updating submission:", error);
      toast({
        title: "Error",
        description: "Failed to update submission",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-[#fbfaf8] mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Submitted Forms</h2>
          <p className="text-muted-foreground mt-1">View and manage all form submissions in one place</p>
        </div>
      </div>
      
      <div className="space-y-8">
        {editingSubmission && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-[#2A6F97]">Edit Submission</h2>
            <FormContainer 
              editingSubmission={editingSubmission} 
              onUpdate={handleUpdate}
            />
          </div>
        )}

        <SubmissionsTable 
          submissions={submissions}
          onEdit={handleEdit}
        />
      </div>
    </div>
  );
};

export default SubmittedForms;