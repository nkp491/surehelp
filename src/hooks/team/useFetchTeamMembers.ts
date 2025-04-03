
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TeamMember } from "@/types/team";

/**
 * Hook to fetch team members for a specific team
 */
export const useFetchTeamMembers = (teamId?: string) => {
  return useQuery({
    queryKey: ['team-members', teamId],
    queryFn: async () => {
      if (!teamId) return [];
      
      try {
        const { data, error } = await supabase
          .from('team_members')
          .select(`
            id,
            user_id,
            role,
            profiles:user_id (
              id,
              first_name,
              last_name,
              email,
              profile_image_url
            )
          `)
          .eq('team_id', teamId);
          
        if (error) throw error;
        
        return data.map((member: any) => ({
          id: member.id,
          userId: member.user_id,
          role: member.role,
          profile: member.profiles
        })) as TeamMember[];
      } catch (error) {
        console.error("Error fetching team members:", error);
        return [];
      }
    },
    enabled: !!teamId,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });
};
