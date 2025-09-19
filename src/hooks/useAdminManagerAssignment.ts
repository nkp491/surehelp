import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import {
  Profile,
  Team,
  TeamInsert,
  UserRole,
} from "@/integrations/supabase/types";

interface AdminManagerAssignmentResult {
  success: boolean;
  error?: string;
  teamId?: string;
  managerName?: string;
}

interface UseAdminManagerAssignmentReturn {
  assignManagerToUser: (
    targetUserId: string,
    managerEmail: string
  ) => Promise<AdminManagerAssignmentResult>;
  removeManagerFromUser: (
    targetUserId: string
  ) => Promise<AdminManagerAssignmentResult>;
  isLoading: boolean;
}

export const useAdminManagerAssignment = (): UseAdminManagerAssignmentReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const queryClient = useQueryClient();

  const findExistingTeam = async (
    managerEmail: string
  ): Promise<{ teamId?: string; error?: string }> => {
    const { data: existingTeam, error: teamError } = await supabase
      .from("teams")
      .select("*")
      .eq("manager", managerEmail)
      .maybeSingle();

    if (teamError) {
      console.error("Error checking existing team:", teamError);
      return { error: "Error checking existing team" };
    }

    if (existingTeam) {
      const team = existingTeam as Team;
      console.log("Found existing team:", team.name);
      return { teamId: team.id };
    }

    return {};
  };

  const createNewTeam = async (
    managerEmail: string
  ): Promise<{ teamId?: string; error?: string }> => {
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, email")
      .eq("email", managerEmail)
      .maybeSingle();

    if (profileError || !profileData) {
      return { error: "This email does not exist in our system" };
    }

    const profile = profileData as Profile;

    const { data: userRoles, error: rolesError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", profile.id);

    if (rolesError) {
      console.error("Error checking user roles:", rolesError);
      return { error: "Error checking user roles" };
    }

    const managerRoles = [
      "manager",
      "manager_pro",
      "manager_pro_gold",
      "manager_pro_platinum",
    ];
    const roles = userRoles as UserRole[] | null;
    const hasManagerRole =
      roles?.some((role: UserRole) => managerRoles.includes(role.role)) ??
      false;

    if (!hasManagerRole) {
      return { error: "This email does not belong to a manager account" };
    }

    const teamName = `${profile.first_name}'s Team`;
    const teamInsertData: TeamInsert = {
      name: teamName,
      manager: managerEmail,
    };
    const { data: newTeam, error: createTeamError } = await supabase
      .from("teams")
      .insert(teamInsertData)
      .select("*")
      .single();

    if (createTeamError) {
      console.error("Error creating team:", createTeamError);
      return { error: "Error creating team for manager" };
    }

    const newTeamData = newTeam as Team;
    console.log("Created new team:", teamName);
    return { teamId: newTeamData.id };
  };

  const addUserToTeam = async (
    teamId: string,
    targetUserId: string
  ): Promise<string | null> => {
    // First, check if user already exists in team_members table
    const { data: existingMember, error: checkError } = await supabase
      .from("team_members")
      .select("id, team_id")
      .eq("user_id", targetUserId)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking existing team membership:", checkError);
      return "Error checking existing team membership";
    }

    if (existingMember) {
      // User already exists in team_members table, update the team_id
      const { error: updateError } = await supabase
        .from("team_members")
        .update({ team_id: teamId })
        .eq("user_id", targetUserId);

      if (updateError) {
        console.error("Error updating user's team:", updateError);
        return "Error updating user's team";
      }

      console.log(`Updated existing team membership for user ${targetUserId} to team ${teamId}`);
    } else {
      // User doesn't exist in team_members table, create new entry
      const teamMemberInsertData = {
        team_id: teamId,
        user_id: targetUserId,
      };
      const { error: insertMemberError } = await supabase
        .from("team_members")
        .insert([teamMemberInsertData]);

      if (insertMemberError) {
        console.error("Error adding user to team:", insertMemberError);
        return "Error assigning to team";
      }

      console.log(`Created new team membership for user ${targetUserId} in team ${teamId}`);
    }

    return null;
  };

  const assignManagerToUser = async (
    targetUserId: string,
    managerEmail: string
  ): Promise<AdminManagerAssignmentResult> => {
    setIsLoading(true);

    try {
      // Team limit checks removed as requested

      // Check for existing team or create new one
      const existingTeamResult = await findExistingTeam(managerEmail);
      if (existingTeamResult.error) {
        return { success: false, error: existingTeamResult.error };
      }

      let teamId: string;
      if (existingTeamResult.teamId) {
        teamId = existingTeamResult.teamId;
      } else {
        const newTeamResult = await createNewTeam(managerEmail);
        if (newTeamResult.error) {
          return { success: false, error: newTeamResult.error };
        }
        teamId = newTeamResult.teamId!;
      }

      // Add user to team
      const addUserError = await addUserToTeam(teamId, targetUserId);
      if (addUserError) {
        return { success: false, error: addUserError };
      }

      // Get manager name for display
      const { data: managerProfile } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("email", managerEmail)
        .single();

      const managerName = managerProfile
        ? `${managerProfile.first_name} ${managerProfile.last_name}`
        : managerEmail;

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["users-with-roles"] });
      queryClient.invalidateQueries({ queryKey: ["team-membership"] });
      queryClient.invalidateQueries({ queryKey: ["user-teams"] });
      queryClient.invalidateQueries({ queryKey: ["team-members"] });

      return { success: true, teamId, managerName };
    } catch (error: unknown) {
      console.error("Error in admin manager assignment:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unexpected error occurred";
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const removeManagerFromUser = async (
    targetUserId: string
  ): Promise<AdminManagerAssignmentResult> => {
    setIsLoading(true);

    try {
      // Remove user from all teams
      const { error: removeError } = await supabase
        .from("team_members")
        .delete()
        .eq("user_id", targetUserId);

      if (removeError) {
        console.error("Error removing user from teams:", removeError);
        return { success: false, error: "Error removing user from teams" };
      }

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["users-with-roles"] });
      queryClient.invalidateQueries({ queryKey: ["team-membership"] });
      queryClient.invalidateQueries({ queryKey: ["user-teams"] });
      queryClient.invalidateQueries({ queryKey: ["team-members"] });

      return { success: true };
    } catch (error: unknown) {
      console.error("Error in removing manager:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unexpected error occurred";
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    assignManagerToUser,
    removeManagerFromUser,
    isLoading,
  };
};
