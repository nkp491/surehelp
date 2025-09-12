import { useQuery } from "@tanstack/react-query";
import { useTeamMemberCount } from "./useTeamMemberCount";
import { getTeamSizeLimit } from "@/utils/teamLimits";
import { supabase } from "@/integrations/supabase/client";

interface TeamLimitValidationResult {
  canAdd: boolean;
  message: string;
  currentCount: number;
  limit: number;
  managerRole: string | null;
  isLoading: boolean;
  error: Error | null;
}

interface UseTeamLimitValidationProps {
  managerId?: string;
  enabled?: boolean;
}

export const useTeamLimitValidation = ({
  managerId,
  enabled = true,
}: UseTeamLimitValidationProps = {}): TeamLimitValidationResult => {
  const {
    count: currentCount,
    isLoading: countLoading,
    error: countError,
  } = useTeamMemberCount({ managerId, enabled });

  // Get manager role to determine limits
  const {
    data: managerRole,
    isLoading: roleLoading,
    error: roleError,
  } = useQuery({
    queryKey: ["manager-role", managerId],
    queryFn: async () => {
      if (!managerId) return null;

      const { data: roles, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", managerId)
        .in("role", [
          "manager",
          "manager_pro",
          "manager_pro_gold",
          "manager_pro_platinum",
        ])
        .single();

      if (error) {
        console.error("Error fetching manager role:", error);
        return null;
      }

      return roles?.role || null;
    },
    enabled: enabled && !!managerId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const isLoading = countLoading || roleLoading;
  const error = countError || roleError;

  // Calculate validation result
  const getValidationResult = (): TeamLimitValidationResult => {
    if (isLoading) {
      return {
        canAdd: false,
        message: "Checking team limits...",
        currentCount: 0,
        limit: 0,
        managerRole: null,
        isLoading: true,
        error: null,
      };
    }

    if (error) {
      return {
        canAdd: false,
        message: "Error checking team limits",
        currentCount: 0,
        limit: 0,
        managerRole: null,
        isLoading: false,
        error: error,
      };
    }

    if (!managerRole) {
      return {
        canAdd: false,
        message: "Manager role not found or invalid",
        currentCount: currentCount,
        limit: 0,
        managerRole: null,
        isLoading: false,
        error: null,
      };
    }

    const limit = getTeamSizeLimit(managerRole);
    const canAdd = limit === -1 || currentCount < limit;

    let message = "";
    if (limit === -1) {
      message = "Unlimited team members allowed";
    } else if (canAdd) {
      const remaining = limit - currentCount;
      message = `Can add ${remaining} more team member${
        remaining !== 1 ? "s" : ""
      } (${currentCount}/${limit})`;
    } else {
      message = `Team limit reached (${currentCount}/${limit}). Cannot add more members.`;
    }

    return {
      canAdd,
      message,
      currentCount,
      limit,
      managerRole,
      isLoading: false,
      error: null,
    };
  };

  return getValidationResult();
};
