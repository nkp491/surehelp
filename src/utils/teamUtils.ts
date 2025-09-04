import { supabase } from "@/integrations/supabase/client";

export interface TeamMembershipInfo {
  team_id: string;
  team_name: string;
  manager_id: string;
  manager_name: string;
  manager_email: string;
  role: string;
}

/**
 * Check if a user is a team member and get their team information
 * @param userId - The user ID to check
 * @returns TeamMembershipInfo if user is a team member, null otherwise
 */
export async function checkTeamMembership(userId: string): Promise<TeamMembershipInfo | null> {
  try {
    // Check if user is in any team_members table
    const { data: teamMember, error: teamMemberError } = await supabase
      .from("team_members")
      .select("team_id, role")
      .eq("user_id", userId)
      .maybeSingle();

    if (teamMemberError) {
      console.error("Error checking team membership:", teamMemberError);
      return null;
    }

    if (!teamMember) {
      console.log("User is not a team member");
      return null;
    }

    // Get team information
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .select("id, name")
      .eq("id", teamMember.team_id)
      .maybeSingle();

    if (teamError) {
      console.error("Error fetching team:", teamError);
      return null;
    }

    // Get team manager information
    const { data: teamManager, error: managerError } = await supabase
      .from("team_managers")
      .select("user_id")
      .eq("team_id", teamMember.team_id)
      .maybeSingle();

    if (managerError) {
      console.error("Error fetching team manager:", managerError);
      return null;
    }

    // Get manager profile
    const { data: managerProfile, error: profileError } = await supabase
      .from("profiles")
      .select("first_name, last_name, email")
      .eq("id", teamManager.user_id)
      .maybeSingle();

    if (profileError) {
      console.error("Error fetching manager profile:", profileError);
      return null;
    }

    return {
      team_id: team.id,
      team_name: team.name,
      manager_id: teamManager.user_id,
      manager_name: `${managerProfile.first_name} ${managerProfile.last_name}`.trim(),
      manager_email: managerProfile.email || "",
      role: teamMember.role
    };
  } catch (error) {
    console.error("Error in checkTeamMembership:", error);
    return null;
  }
}

/**
 * Check if current user is a team member and get their team information
 * @returns TeamMembershipInfo if current user is a team member, null otherwise
 */
export async function checkCurrentUserTeamMembership(): Promise<TeamMembershipInfo | null> {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("User not authenticated");
    }

    return await checkTeamMembership(user.id);
  } catch (error) {
    console.error("Error checking current user team membership:", error);
    return null;
  }
}

/**
 * Get all team members for a specific team
 * @param teamId - The team ID
 * @returns Array of team member information
 */
export async function getTeamMembers(teamId: string) {
  try {
    const { data: teamMembers, error } = await supabase
      .from("team_members")
      .select(`
        user_id,
        role,
        profiles!inner(
          id,
          first_name,
          last_name,
          email,
          profile_image_url
        )
      `)
      .eq("team_id", teamId);

    if (error) {
      console.error("Error fetching team members:", error);
      return [];
    }

    return teamMembers?.map(member => ({
      user_id: member.user_id,
      role: member.role,
      profile: member.profiles
    })) || [];
  } catch (error) {
    console.error("Error in getTeamMembers:", error);
    return [];
  }
}
