import { supabase } from "@/integrations/supabase/client";

/**
 * Handles team assignment when a user assigns a manager to themselves
 * @param userId - The ID of the user assigning the manager
 * @param managerId - The ID of the manager being assigned
 * @param toastCallback - Optional callback for showing toast notifications
 */
export async function handleTeamAssignment(
  userId: string, 
  managerId: string | null,
  toastCallback?: (title: string, description: string, variant?: "default" | "destructive") => void
) {
  try {
    console.log("Handling team assignment for user:", userId, "manager:", managerId);
    
    if (!managerId) {
      // If manager is being removed, remove user from all teams
      console.log("Removing user from all teams");
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("user_id", userId);
      
      if (error) {
        console.error("Error removing user from teams:", error);
        throw error;
      }
      return;
    }

    // Check if the manager has a team
    const { data: managerTeams, error: teamError } = await supabase
      .from("team_members")
      .select("team_id")
      .eq("user_id", managerId)
      .in("role", ["manager_pro", "manager_pro_gold", "manager_pro_platinum"]);

    if (teamError) {
      console.error("Error checking manager teams:", teamError);
      throw teamError;
    }

    let teamId: string;

    if (managerTeams && managerTeams.length > 0) {
      // Manager has existing teams, use the first one
      teamId = managerTeams[0].team_id;
      console.log("Manager has existing team:", teamId);
    } else {
      // Manager doesn't have a team, create one
      console.log("Creating new team for manager:", managerId);
      
      // Get manager's name for team name
      const { data: managerProfile, error: profileError } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", managerId)
        .single();

      if (profileError) {
        console.error("Error fetching manager profile:", profileError);
        throw profileError;
      }

      const teamName = `${managerProfile?.first_name || 'Manager'}'s Team`;
      
      // Create new team
      const { data: newTeam, error: createTeamError } = await supabase
        .from("teams")
        .insert([{ name: teamName }])
        .select()
        .single();

      if (createTeamError) {
        console.error("Error creating team:", createTeamError);
        throw createTeamError;
      }

      teamId = newTeam.id;
      console.log("Created new team:", teamId);

      // Add manager to the team
      const { error: addManagerError } = await supabase
        .from("team_members")
        .insert([{
          team_id: teamId,
          user_id: managerId,
          role: "manager_pro" // Default role, can be updated based on actual manager role
        }]);

      if (addManagerError) {
        console.error("Error adding manager to team:", addManagerError);
        throw addManagerError;
      }
    }

    // Check if user is already a member of this team
    const { data: existingMembership, error: checkError } = await supabase
      .from("team_members")
      .select("id")
      .eq("team_id", teamId)
      .eq("user_id", userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error("Error checking existing membership:", checkError);
      throw checkError;
    }

    if (existingMembership) {
      console.log("User already a member of team:", teamId);
      return;
    }

    // Get user's role to assign appropriate team role
    const { data: userRoles, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    if (roleError) {
      console.error("Error fetching user roles:", roleError);
      throw roleError;
    }

    // Determine team role based on user's highest role
    let teamRole = "agent"; // Default role
    if (userRoles && userRoles.length > 0) {
      const roles = userRoles.map(ur => ur.role);
      if (roles.includes("manager_pro_platinum")) {
        teamRole = "manager_pro_platinum";
      } else if (roles.includes("manager_pro_gold")) {
        teamRole = "manager_pro_gold";
      } else if (roles.includes("manager_pro")) {
        teamRole = "manager_pro";
      } else if (roles.includes("agent_pro")) {
        teamRole = "agent_pro";
      }
    }

    // Add user to the team
    const { error: addMemberError } = await supabase
      .from("team_members")
      .insert([{
        team_id: teamId,
        user_id: userId,
        role: teamRole
      }]);

    if (addMemberError) {
      console.error("Error adding user to team:", addMemberError);
      throw addMemberError;
    }

    console.log("Successfully added user to team:", teamId, "with role:", teamRole);

    // Show success notification if toast callback is provided
    if (toastCallback) {
      toastCallback(
        "Team assignment successful",
        "You have been added to your manager's team."
      );
    }

  } catch (error) {
    console.error("Error handling team assignment:", error);
    
    // Show error notification if toast callback is provided
    if (toastCallback) {
      toastCallback(
        "Team assignment error",
        "There was a problem assigning you to the team. Please try again.",
        "destructive"
      );
    }
    
    throw error;
  }
}
