
import { useState, useEffect } from "react";
import { FormSubmission } from "@/types/form";
import SubmissionsTable from "@/components/SubmissionsTable";
import FormContainer from "@/components/FormContainer";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { useRoleCheck } from "@/hooks/useRoleCheck";
import { FeatureRestriction } from "@/components/submissions/FeatureRestriction";

const SubmittedForms = () => {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [editingSubmission, setEditingSubmission] = useState<FormSubmission | null>(null);
  const { toast } = useToast();
  const { hasRequiredRole } = useRoleCheck();

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

  // Get the maximum number of submissions based on user role
  const getSubmissionLimit = () => {
    if (hasRequiredRole(['agent_pro', 'manager_pro', 'manager_pro_gold', 'manager_pro_platinum', 'beta_user', 'system_admin'])) {
      return Infinity; // Unlimited for higher tiers
    }
    return 10; // Basic limit for regular agents
  };

  const submissionLimit = getSubmissionLimit();
  const isLimitExceeded = submissions.length > submissionLimit;
  const displayedSubmissions = isLimitExceeded 
    ? submissions.slice(0, submissionLimit) 
    : submissions;

  return (
    <div className="space-y-6 py-6 sm:py-8 md:py-10">
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-[#fbfaf8]">
        <div className="max-w-3xl">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Client Book of Business</h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">View and manage all client submissions</p>
        </div>
      </div>
      <div className="space-y-6 sm:space-y-8">
        <Card className="w-full p-4 sm:p-6 shadow-sm bg-[#F1F1F1]">
          <div className="space-y-6">
            {editingSubmission && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold mb-4 text-[#2A6F97]">Edit Submission</h2>
                <FormContainer 
                  editingSubmission={editingSubmission} 
                  onUpdate={handleUpdate}
                />
              </div>
            )}

            <div className="bg-white p-6 rounded-lg shadow-sm">
              {isLimitExceeded && (
                <FeatureRestriction
                  feature="Full Client History"
                  requiredRole="agent_pro"
                  description="Upgrade to Agent Pro to access your complete client history. Basic agents are limited to viewing their 10 most recent submissions."
                >
                  <></>
                </FeatureRestriction>
              )}

              <SubmissionsTable 
                submissions={displayedSubmissions}
                onEdit={handleEdit}
              />
            </div>

            {/* Advanced analytics feature locked behind agent_pro role */}
            {!hasRequiredRole(['agent_pro', 'manager_pro', 'manager_pro_gold', 'manager_pro_platinum', 'beta_user', 'system_admin']) && (
              <div className="mt-8">
                <FeatureRestriction
                  feature="Client Analytics"
                  requiredRole="agent_pro"
                  description="Unlock detailed client analytics and insights by upgrading to Agent Pro. Analyze conversion rates, client demographics, and more."
                >
                  <></>
                </FeatureRestriction>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SubmittedForms;
