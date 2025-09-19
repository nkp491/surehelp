import { supabase } from "@/integrations/supabase/client";

// Team member limits based on manager roles
export const TEAM_LIMITS = {
  manager: 5,
  manager_pro: 20,
  manager_pro_gold: 50,
  manager_pro_platinum: Infinity, // Unlimited
} as const;

export type ManagerRole = keyof typeof TEAM_LIMITS;

/**
 * Gets the team member limit for a specific manager role
 */
export const getTeamLimit = (role: ManagerRole): number => {
  return TEAM_LIMITS[role];
};

/**
 * Gets the highest manager role from a list of user roles
 */
export const getHighestManagerRole = (userRoles: string[]): ManagerRole | null => {
  const managerRoles: ManagerRole[] = ['manager_pro_platinum', 'manager_pro_gold', 'manager_pro', 'manager'];
  
  for (const role of managerRoles) {
    if (userRoles.includes(role)) {
      return role;
    }
  }
  
  return null;
};

/**
 * Checks if a manager can add more team members based on their role limits
 */
export const canAddTeamMember = async (managerId: string): Promise<{
  canAdd: boolean;
  currentCount: number;
  limit: number;
  role: ManagerRole | null;
  error?: string;
}> => {
  try {
    // Get manager's roles
    const { data: userRoles, error: rolesError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", managerId);

    if (rolesError) {
      return {
        canAdd: false,
        currentCount: 0,
        limit: 0,
        role: null,
        error: "Error fetching manager roles"
      };
    }

    const roles = userRoles?.map(ur => ur.role) || [];
    const highestManagerRole = getHighestManagerRole(roles);

    if (!highestManagerRole) {
      return {
        canAdd: false,
        currentCount: 0,
        limit: 0,
        role: null,
        error: "User does not have manager privileges"
      };
    }

    // Get manager's email first
    const { data: managerProfile, error: profileError } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", managerId)
      .single();

    if (profileError || !managerProfile) {
      return {
        canAdd: false,
        currentCount: 0,
        limit: 0,
        role: highestManagerRole,
        error: "Manager profile not found"
      };
    }

    // Get team ID for this manager
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .select("id")
      .eq("manager", managerProfile.email)
      .single();

    if (teamError || !team) {
      return {
        canAdd: false,
        currentCount: 0,
        limit: 0,
        role: highestManagerRole,
        error: "Team not found for manager"
      };
    }

    // Get current team member count
    const { data: teamMembers, error: membersError } = await supabase
      .from("team_members")
      .select("id")
      .eq("team_id", team.id);

    if (membersError) {
      return {
        canAdd: false,
        currentCount: 0,
        limit: 0,
        role: highestManagerRole,
        error: "Error fetching team members"
      };
    }

    const currentCount = teamMembers?.length || 0;
    const limit = getTeamLimit(highestManagerRole);
    const canAdd = currentCount < limit;

    return {
      canAdd,
      currentCount,
      limit,
      role: highestManagerRole
    };
  } catch (error) {
    console.error("Error checking team limits:", error);
    return {
      canAdd: false,
      currentCount: 0,
      limit: 0,
      role: null,
      error: "Unexpected error occurred"
    };
  }
};

/**
 * Checks team limits by manager email (for manager assignment)
 */
export const canAddTeamMemberByEmail = async (managerEmail: string): Promise<{
  canAdd: boolean;
  currentCount: number;
  limit: number;
  role: ManagerRole | null;
  error?: string;
}> => {
  try {
    // Get manager profile by email
    const { data: managerProfile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", managerEmail)
      .single();

    if (profileError || !managerProfile) {
      return {
        canAdd: false,
        currentCount: 0,
        limit: 0,
        role: null,
        error: "Manager not found"
      };
    }

    return await canAddTeamMember(managerProfile.id);
  } catch (error) {
    console.error("Error checking team limits by email:", error);
    return {
      canAdd: false,
      currentCount: 0,
      limit: 0,
      role: null,
      error: "Unexpected error occurred"
    };
  }
};