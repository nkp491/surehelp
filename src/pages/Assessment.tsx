
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AssessmentFormSection from "@/components/dashboard/AssessmentFormSection";
import { useRoleCheck } from "@/hooks/useRoleCheck";
import { UpgradePrompt } from "@/components/common/UpgradePrompt";

const Assessment = () => {
  const [isFormOpen, setIsFormOpen] = useState(true);
  const [submissionCount, setSubmissionCount] = useState(0);
  const { hasRequiredRole } = useRoleCheck();
  const { toast } = useToast();
  
  // Check submission limits for basic agents
  useEffect(() => {
    const checkSubmissionLimits = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Only check limits for basic agents
        if (hasRequiredRole(['agent_pro', 'manager_pro', 'manager_pro_gold', 'manager_pro_platinum', 'beta_user', 'system_admin'])) {
          return;
        }

        const { count, error } = await supabase
          .from('submissions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (error) throw error;
        setSubmissionCount(count || 0);
      } catch (error) {
        console.error("Error checking submission limits:", error);
      }
    };

    checkSubmissionLimits();
  }, [hasRequiredRole]);

  // Maximum submissions allowed for basic agents
  const MAX_SUBMISSIONS_FOR_BASIC = 5;
  const isLimitReached = submissionCount >= MAX_SUBMISSIONS_FOR_BASIC && 
    !hasRequiredRole(['agent_pro', 'manager_pro', 'manager_pro_gold', 'manager_pro_platinum', 'beta_user', 'system_admin']);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <div className="w-full max-w-[95vw] mx-auto px-0 pt-4">
        {isLimitReached ? (
          <div className="p-6">
            <UpgradePrompt
              title="Assessment Limit Reached"
              description={`You have reached the maximum limit of ${MAX_SUBMISSIONS_FOR_BASIC} assessment submissions. Upgrade to Agent Pro for unlimited assessments and advanced features.`}
              requiredRole="agent_pro"
            />
          </div>
        ) : (
          <AssessmentFormSection 
            isFormOpen={isFormOpen}
            setIsFormOpen={setIsFormOpen}
          />
        )}
      </div>
    </div>
  );
};

export default Assessment;
