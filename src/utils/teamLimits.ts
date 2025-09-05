import { supabase } from "@/integrations/supabase/client";

export const TEAM_SIZE_LIMITS = {
  manager: 5,
  manager_pro: 20,
  manager_pro_gold: 50,
  manager_pro_platinum: -1,
} as const;

export type ManagerRole = keyof typeof TEAM_SIZE_LIMITS;

export const getTeamSizeLimit = (role: string): number => {
  const normalizedRole = role.toLowerCase().replace(/\s+/g, "_");
  if (normalizedRole in TEAM_SIZE_LIMITS) {
    return TEAM_SIZE_LIMITS[normalizedRole as ManagerRole];
  }
  for (const [key, limit] of Object.entries(TEAM_SIZE_LIMITS)) {
    if (normalizedRole.includes(key)) {
      return limit;
    }
  }
  return 5;
};
export const getCurrentTeamSize = async (
  managerId: string
): Promise<number> => {
  try {
    const { data: managerTeam, error: teamError } = await supabase
      .from("team_managers")
      .select("team_id")
      .eq("user_id", managerId)
      .single();
    if (teamError || !managerTeam) {
      return 0;
    }
    const { data: teamMembers, error: membersError } = await supabase
      .from("team_members")
      .select("user_id")
      .eq("team_id", managerTeam.team_id);
    if (membersError) {
      console.error("Error fetching team members:", membersError);
      return 0;
    }
    const memberCount = teamMembers.filter(
      (member) => member.user_id !== managerId
    ).length;
    return memberCount;
  } catch (error) {
    console.error("Error getting current team size:", error);
    return 0;
  }
};

export const canAddTeamMember = async (
  managerId: string
): Promise<{
  canAdd: boolean;
  currentSize: number;
  limit: number;
  message?: string;
}> => {
  try {
    const { data: managerRoles, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", managerId)
      .in("role", [
        "manager",
        "manager_pro",
        "manager_pro_gold",
        "manager_pro_platinum",
      ]);
    if (roleError || !managerRoles || managerRoles.length === 0) {
      return {
        canAdd: false,
        currentSize: 0,
        limit: 0,
        message: "Manager role not found",
      };
    }

    const managerRole = managerRoles[0].role;
    const limit = getTeamSizeLimit(managerRole);
    const currentSize = await getCurrentTeamSize(managerId);

    if (limit === -1) {
      return {
        canAdd: true,
        currentSize,
        limit: -1,
        message: "Unlimited team size",
      };
    }

    const canAdd = currentSize < limit;
    const message = canAdd
      ? `Can add ${limit - currentSize} more team members`
      : `Team size limit reached (${limit} members). Current: ${currentSize}`;

    return {
      canAdd,
      currentSize,
      limit,
      message,
    };
  } catch (error) {
    console.error("Error checking team member limit:", error);
    return {
      canAdd: false,
      currentSize: 0,
      limit: 0,
      message: "Error checking team limits",
    };
  }
};

export const getTeamSizeInfo = (role: string, currentSize: number) => {
  const limit = getTeamSizeLimit(role);
  const isUnlimited = limit === -1;

  return {
    current: currentSize,
    limit: isUnlimited ? "Unlimited" : limit,
    remaining: isUnlimited ? "Unlimited" : Math.max(0, limit - currentSize),
    isAtLimit: !isUnlimited && currentSize >= limit,
    isUnlimited,
  };
};
