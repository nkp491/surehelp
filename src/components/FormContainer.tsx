
import { FormSubmission } from "@/types/form";
import { FormBuilderProvider } from "@/contexts/FormBuilderContext";
import { SpouseVisibilityProvider } from "@/contexts/SpouseVisibilityContext";
import { FamilyMembersProvider } from "@/contexts/FamilyMembersContext";
import { MetricsProvider } from "@/contexts/MetricsContext";
import FormContent from "@/components/form/FormContent";
import FamilyMemberToggle from "@/components/form/FamilyMemberToggle";
import LanguageToggle from "@/components/LanguageToggle";
import MetricsSection from "@/components/dashboard/MetricsSection";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UpgradePrompt } from "./common/UpgradePrompt";
import { roleService } from "@/services/roleService";
import LoadingScreen from "./ui/loading-screen";

interface FormContainerProps {
  editingSubmission?: FormSubmission | null;
  onUpdate?: (submission: FormSubmission) => void;
}

const FormContainer = ({ editingSubmission, onUpdate }: FormContainerProps) => {
  const userRoles = roleService.getRoles();
  const [submissionCount, setSubmissionCount] = useState(0);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
      const checkSubmissionLimits = async () => {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) return;
          const { count, error } = await supabase
            .from("submissions")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id);

          if (error) throw error;
          setSubmissionCount(count || 0);
        } catch (error) {
          console.error("Error checking submission limits:", error);
        }finally {
          setLoading(false);
        }
      };
      checkSubmissionLimits();
    }, []);
    const MAX_SUBMISSIONS_FOR_BASIC = 25;
    const isAgent = userRoles.length > 1 ? false : userRoles.includes("agent") ? true : false;
    const isLimitReached = submissionCount >= MAX_SUBMISSIONS_FOR_BASIC && isAgent;

  if (loading) {
    return (
      <LoadingScreen />
    );
  }

  if (isLimitReached) {
    return (
      <div className="pt-7">
        <UpgradePrompt
          title="Assessment Limit Reached"
          description={`You have reached the maximum limit of ${MAX_SUBMISSIONS_FOR_BASIC} assessment submissions. Upgrade to Agent Pro for unlimited assessments and advanced features.`}
          requiredRole="agent_pro"
        />
      </div>
    );
  }
  return (
    <FamilyMembersProvider>
      <FormBuilderProvider>
        <SpouseVisibilityProvider>
          <MetricsProvider>
          <div className="w-full max-w-[98vw] mx-auto">
              <div className="flex justify-end items-center gap-3 mb-1 px-8">
                <FamilyMemberToggle /> 
                <LanguageToggle />
              </div>
              <div className="bg-grid min-h-[calc(100vh-120px)]">
                <MetricsSection />
                <FormContent editingSubmission={editingSubmission} onUpdate={onUpdate} />
              </div>
            </div>
          </MetricsProvider>
        </SpouseVisibilityProvider>
      </FormBuilderProvider>
    </FamilyMembersProvider>
  );
};

export default FormContainer;