import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UseTeamMemberCountProps {
  managerId?: string;
  enabled?: boolean;
}

interface TeamMemberCountResult {
  count: number;
  teamId: string | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}
export const useTeamMemberCount = ({
  managerId,
  enabled = true,
}: UseTeamMemberCountProps = {}): TeamMemberCountResult => {
  const {
    data: result,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["team-member-count", managerId],
    queryFn: async () => {
      if (!managerId) {
        return { count: 0, teamId: null };
      }
      try {
        const { data: managerTeam, error: teamError } = await supabase
          .from("team_managers")
          .select("team_id")
          .eq("user_id", managerId)
          .single();
        if (teamError) {
          console.error("Error fetching manager team:", teamError);
          throw new Error(
            `Failed to get team for manager: ${teamError.message}`
          );
        }
        if (!managerTeam) {
          return { count: 0, teamId: null };
        }
        const teamId = managerTeam.team_id;
        const { data: teamMembers, error: membersError } = await supabase
          .from("team_members")
          .select("user_id")
          .eq("team_id", teamId);
        if (membersError) {
          console.error("Error fetching team members:", membersError);
          throw new Error(
            `Failed to get team members: ${membersError.message}`
          );
        }
        const membersExcludingManager =
          teamMembers?.filter((member) => member.user_id !== managerId) || [];
        return {
          count: membersExcludingManager.length,
          teamId: teamId,
        };
      } catch (error) {
        console.error("Error in useTeamMemberCount:", error);
        throw error;
      }
    },
    enabled: enabled && !!managerId,
    staleTime: 1000 * 60 * 2,
    retry: 2,
  });

  return {
    count: result?.count || 0,
    teamId: result?.teamId || null,
    isLoading,
    error: error as unknown as Error | null,
    refetch,
  };
};
