import { useState } from "react";
import { FormSubmission } from "@/types/form";
import SubmissionsTable from "@/components/SubmissionsTable";
import FormContainer from "@/components/FormContainer";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

const SubmittedForms = () => {
  const [editingSubmission, setEditingSubmission] = useState<FormSubmission | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ['submissions'],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No authenticated user');

        const { data, error } = await supabase
          .from('submissions')
          .select('*')
          .eq('user_id', user.id)
          .order('timestamp', { ascending: false });

        if (error) throw error;

        // Transform the data to match FormSubmission type
        return data.map(submission => ({
          ...(JSON.parse(submission.data as string) as Omit<FormSubmission, 'timestamp' | 'outcome'>),
          timestamp: submission.timestamp,
          outcome: submission.outcome
        }));
      } catch (error) {
        console.error("Error loading submissions:", error);
        toast({
          title: "Error",
          description: "Failed to load submissions",
          variant: "destructive",
        });
        return [];
      }
    }
  });

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

      toast({
        title: "Success",
        description: "Submission updated successfully",
      });
      
      await queryClient.invalidateQueries({ queryKey: ['submissions'] });
      setEditingSubmission(null);
    } catch (error) {
      console.error("Error updating submission:", error);
      toast({
        title: "Error",
        description: "Failed to update submission",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-4">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-[#fbfaf8] mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Submitted Forms</h2>
          <p className="text-muted-foreground mt-1">View and manage all form submissions in one place</p>
        </div>
      </div>
      
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
  );
};

export default SubmittedForms;