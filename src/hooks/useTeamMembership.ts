import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TeamMembershipInfo {
  team_id: string;
  team_name: string;
  manager_id: string;
  manager_name: string;
  manager_email: string;
  role: string;
}

export function useTeamMembership() {
  const {
    data: teamMembership,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["team-membership"],
    queryFn: async (): Promise<TeamMembershipInfo | null> => {
      try {
        // Get current user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError || !user) {
          throw new Error("User not authenticated");
        }

        // Check if user is in any team_members table
        const { data: teamMember, error: teamMemberError } = await supabase
          .from("team_members")
          .select("team_id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (teamMemberError) {
          console.error("Error checking team membership:", teamMemberError);
          return null;
        }

        if (!teamMember) {
          return null;
        }

        // Check if user is also a team manager for this team
        const { data: teamManager, error: managerCheckError } = await supabase
          .from("team_managers")
          .select("user_id")
          .eq("team_id", teamMember.team_id)
          .eq("user_id", user.id)
          .maybeSingle();

        if (managerCheckError) {
          console.error(
            "Error checking if user is team manager:",
            managerCheckError
          );
          return null;
        }

        // If user is the team manager, don't show them as their own manager
        if (teamManager) {
          return null;
        }

        // Get team information
        const { data: team, error: teamError } = await supabase
          .from("teams")
          .select("id, name, manager")
          .eq("id", teamMember.team_id)
          .maybeSingle();

        if (teamError) {
          console.error("Error fetching team:", teamError);
          return null;
        }

        // Get manager information from teams table
        const managerEmail = team.manager;
        
        if (!managerEmail) {
          console.error("No manager email found in team");
          return null;
        }

        // Get manager profile using the email from teams.manager
        const { data: managerProfile, error: profileError } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, email")
          .eq("email", managerEmail)
          .maybeSingle();

        if (profileError) {
          console.error("Error fetching manager profile:", profileError);
          return null;
        }

        if (!managerProfile) {
          console.error("Manager profile not found for email:", managerEmail);
          return null;
        }

        // Get user's role from user_roles table
        const { data: userRoles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .limit(1);

        const userRole = userRoles && userRoles.length > 0 ? userRoles[0].role : "member";

        return {
          team_id: team.id,
          team_name: team.name,
          manager_id: managerProfile.id,
          manager_name:
            `${managerProfile.first_name} ${managerProfile.last_name}`.trim(),
          manager_email: managerProfile.email || "",
          role: userRole,
        };
      } catch (error) {
        console.error("Error in useTeamMembership:", error);
        return null;
      }
    },
    enabled: true, // Always run this query
  });

  return {
    teamMembership,
    isLoading,
    error,
    isTeamMember: !!teamMembership,
  };
}
