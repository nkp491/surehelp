
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TeamBulletin } from "@/types/team";

/**
 * Hook to fetch team bulletins with author information
 */
export const useFetchTeamBulletins = (teamId?: string) => {
  return useQuery({
    queryKey: ['team-bulletins', teamId],
    queryFn: async () => {
      if (!teamId) return [];

      // First, fetch the bulletins
      const { data: bulletinsData, error: bulletinsError } = await supabase
        .from('team_bulletins')
        .select('*')
        .eq('team_id', teamId)
        .order('pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (bulletinsError) throw bulletinsError;

      // Get the list of creator IDs to fetch their profiles
      const creatorIds = bulletinsData.map(bulletin => bulletin.created_by);
      
      // Fetch the profiles for these creators
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, profile_image_url')
        .in('id', creatorIds);
      
      if (profilesError) throw profilesError;

      // Create a map of user IDs to their profile information
      const profileMap = profiles.reduce((acc, profile) => {
        acc[profile.id] = profile;
        return acc;
      }, {} as Record<string, any>);

      // Merge the bulletins with their creator's profile information
      return bulletinsData.map((bulletin) => ({
        ...bulletin,
        author_name: profileMap[bulletin.created_by] ? 
          `${profileMap[bulletin.created_by].first_name || ''} ${profileMap[bulletin.created_by].last_name || ''}`.trim() : 
          'Unknown',
        author_image: profileMap[bulletin.created_by]?.profile_image_url
      })) as TeamBulletin[];
    },
    enabled: !!teamId,
  });
};
