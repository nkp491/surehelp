import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/profile";
import { toast } from "@/hooks/use-toast";

export const useManagerTeam = (managerId?: string) => {
  const queryClient = useQueryClient();
  const {
    data: teamMembers,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["manager-team", managerId],
    queryFn: async () => {
      if (!managerId) return [];
      // Get manager profile to find their team by email
      const { data: managerProfile, error: profileError } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", managerId)
        .single();
      
      if (profileError || !managerProfile?.email) {
        return [];
      }

      // Find team where this manager's email is in the manager field
      const { data: team, error: teamError } = await supabase
        .from("teams")
        .select("id")
        .eq("manager", managerProfile.email)
        .single();
      
      if (teamError || !team) {
        return [];
      }
      const { data: members, error: membersError } = await supabase
        .from("team_members")
        .select("*")
        .eq("team_id", team.id);
      if (membersError) throw membersError;
      if (!members || members.length === 0) {
        return [];
      }
      const filteredMembers = members.filter(
        (member) => member.user_id !== managerId
      );
      if (filteredMembers.length === 0) {
        return [];
      }
      const userIds = filteredMembers.map((member) => member.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .in("id", userIds);
      if (profilesError) throw profilesError;
      const profileMap = profiles.reduce((acc, profile) => {
        acc[profile.id] = profile;
        return acc;
      }, {} as Record<string, Record<string, unknown>>);
      return filteredMembers.map((member) => ({
        id: member.user_id,
        first_name: profileMap[member.user_id]?.first_name,
        last_name: profileMap[member.user_id]?.last_name,
        email: profileMap[member.user_id]?.email,
        phone: profileMap[member.user_id]?.phone || null,
        profile_image_url: profileMap[member.user_id]?.profile_image_url,
        role: profileMap[member.user_id]?.role,
        roles: [],
        created_at: member.created_at,
        updated_at: member.updated_at,
        last_sign_in: profileMap[member.user_id]?.last_sign_in || null,
        language_preference:
          profileMap[member.user_id]?.language_preference || null,
        manager_id: null,
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

  const updateTeamMemberManager = async (
    memberId: string,
    newManagerId: string | null
  ) => {
    try {
      if (!newManagerId) {
        const { error } = await supabase
          .from("team_members")
          .delete()
          .eq("user_id", memberId);
        if (error) throw error;
        toast({
          title: "Success",
          description: "Team member has been removed from all teams.",
        });
        queryClient.invalidateQueries({
          queryKey: ["manager-team", managerId],
        });
      } else {
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
        // Get new manager profile to find their team by email
        const { data: newManagerProfile, error: newManagerProfileError } = await supabase
          .from("profiles")
          .select("email")
          .eq("id", newManagerId)
          .single();
        
        if (newManagerProfileError || !newManagerProfile?.email) {
          throw new Error("Failed to get new manager profile");
        }

        // Find team where this manager's email is in the manager field
        const { data: newManagerTeam, error: newManagerTeamError } = await supabase
          .from("teams")
          .select("id")
          .eq("manager", newManagerProfile.email)
          .single();
        
        if (newManagerTeamError || !newManagerTeam) {
          throw new Error("Failed to get manager's team");
        }
        
        // Team limit checks removed as requested
        
        await supabase.from("team_members").delete().eq("user_id", memberId);
        const { error: insertError } = await supabase
          .from("team_members")
          .insert([
            {
              team_id: newManagerTeam.id,
              user_id: memberId,
              role: "agent",
            },
          ]);
        if (insertError) throw insertError;
        toast({
          title: "Success",
          description: "Team member has been assigned to a new manager.",
        });
        queryClient.invalidateQueries({
          queryKey: ["manager-team", managerId],
        });
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
