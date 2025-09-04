import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/profile";
import { toast } from "@/hooks/use-toast";

export const useManagerTeam = (managerId?: string) => {
  const queryClient = useQueryClient();
  
  // Get all team members using the teams flow
  const {
    data: teamMembers,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["manager-team", managerId],
    queryFn: async () => {
      if (!managerId) return [];

      // First, get the manager's team from team_managers table
      const { data: managerTeams, error: teamError } = await supabase
        .from("team_managers")
        .select("team_id")
        .eq("user_id", managerId)
        .limit(1);

      if (teamError || !managerTeams || managerTeams.length === 0) {
        console.log("No team found for manager:", managerId);
        return [];
      }

      const managerTeam = managerTeams[0];

      // Get team members from team_members table
      const { data: members, error: membersError } = await supabase
        .from("team_members")
        .select("*")
        .eq("team_id", managerTeam.team_id);

      if (membersError) throw membersError;

      if (!members || members.length === 0) {
        return [];
      }

      // Filter out the manager themselves from the team members list
      const filteredMembers = members.filter(
        (member) => member.user_id !== managerId
      );

      if (filteredMembers.length === 0) {
        return [];
      }

      // Get the list of user IDs to fetch their profiles
      const userIds = filteredMembers.map((member) => member.user_id);

      // Fetch the profiles for these users
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .in("id", userIds);

      if (profilesError) throw profilesError;

      // Create a map of user IDs to their profile information
      const profileMap = profiles.reduce((acc, profile) => {
        acc[profile.id] = profile;
        return acc;
      }, {} as Record<string, Record<string, unknown>>);

      // Merge the team members with their profile information
      return filteredMembers.map((member) => ({
        id: member.user_id,
        first_name: profileMap[member.user_id]?.first_name,
        last_name: profileMap[member.user_id]?.last_name,
        email: profileMap[member.user_id]?.email,
        phone: profileMap[member.user_id]?.phone || null,
        profile_image_url: profileMap[member.user_id]?.profile_image_url,
        role: profileMap[member.user_id]?.role,
        roles: [], // Add empty roles array to match Profile type
        created_at: member.created_at,
        updated_at: member.updated_at,
        last_sign_in: profileMap[member.user_id]?.last_sign_in || null,
        language_preference:
          profileMap[member.user_id]?.language_preference || null,
        manager_id: null, // Not used in teams flow
        terms_accepted_at:
          profileMap[member.user_id]?.terms_accepted_at || null,
        privacy_settings:
          typeof profileMap[member.user_id]?.privacy_settings === "string"
            ? JSON.parse(profileMap[member.user_id]?.privacy_settings as string)
            : profileMap[member.user_id]?.privacy_settings || {
                show_email: false,
                show_phone: false,
                show_photo: true,
              },
        notification_preferences:
          typeof profileMap[member.user_id]?.notification_preferences ===
          "string"
            ? JSON.parse(
                profileMap[member.user_id]?.notification_preferences as string
              )
            : profileMap[member.user_id]?.notification_preferences || {
                email_notifications: true,
                phone_notifications: false,
              },
      })) as Profile[];
    },
    enabled: !!managerId,
  });

  // Update a team member's manager - now uses teams flow
  const updateTeamMemberManager = async (
    memberId: string,
    newManagerId: string | null
  ) => {
    try {
      if (!newManagerId) {
        // Remove user from all teams
        const { error } = await supabase
          .from("team_members")
          .delete()
          .eq("user_id", memberId);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Team member has been removed from all teams.",
        });
        
        // Invalidate the team members query to refresh the list without triggering profile refetch
        queryClient.invalidateQueries({ queryKey: ["manager-team", managerId] });
      } else {
        // Check if the new manager has a valid manager role
        const { data: managerRoles, error: managerRoleError } = await supabase
          .from("user_roles")
          .select("user_id, role")
          .eq("user_id", newManagerId)
          .in("role", [
            "manager_pro",
            "manager_gold",
            "manager_pro_gold",
            "manager_pro_platinum",
          ]);

        if (managerRoleError) {
          throw new Error("Failed to verify manager role");
        }

        if (!managerRoles?.length) {
          throw new Error("Selected user does not have a manager role");
        }

        // Get manager's team
        const { data: teamManagers, error: teamManagerError } = await supabase
          .from("team_managers")
          .select("team_id")
          .eq("user_id", newManagerId)
          .limit(1);

        if (teamManagerError || !teamManagers || teamManagers.length === 0) {
          throw new Error("Failed to get manager's team");
        }

        const teamManager = teamManagers[0];

        // Remove user from any existing team first
        await supabase.from("team_members").delete().eq("user_id", memberId);

        // Add user to the new manager's team
        const { error: insertError } = await supabase
          .from("team_members")
          .insert([
            {
              team_id: teamManager.team_id,
              user_id: memberId,
              role: "agent", // Default role for team members
            },
          ]);

        if (insertError) throw insertError;

        toast({
          title: "Success",
          description: "Team member has been assigned to a new manager.",
        });
        
        // Invalidate the team members query to refresh the list without triggering profile refetch
        queryClient.invalidateQueries({ queryKey: ["manager-team", managerId] });
      }

      return true;
    } catch (error) {
      console.error("Error updating team member:", error.message);
      toast({
        title: "Error",
        description: "Failed to update team member. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    teamMembers,
    isLoading,
    error,
    updateTeamMemberManager,
    refetch,
  };
};
