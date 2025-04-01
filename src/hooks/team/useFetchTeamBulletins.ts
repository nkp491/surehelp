
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TeamBulletin } from "@/types/team";
import { useProfileManagement } from "@/hooks/useProfileManagement";

/**
 * Hook to fetch team bulletins with author information
 */
export const useFetchTeamBulletins = (teamId?: string, directReportsOnly: boolean = false) => {
  const { profile } = useProfileManagement();
  
  // Check if user is higher tier manager
  const isHigherTierManager = profile?.roles?.some(r => 
    r === 'manager_pro_gold' || r === 'manager_pro_platinum'
  ) || profile?.role === 'manager_pro_gold' || profile?.role === 'manager_pro_platinum';

  return useQuery({
    queryKey: ['team-bulletins', teamId, directReportsOnly],
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
        .select('id, first_name, last_name, profile_image_url, manager_id')
        .in('id', creatorIds);
      
      if (profilesError) throw profilesError;

      // For direct reports only, we need to filter bulletins to only show those from direct reports
      let filteredBulletinsData = bulletinsData;
      
      if (directReportsOnly && profile?.id) {
        // If not a higher tier manager, only fetch direct reports' bulletins
        if (!isHigherTierManager) {
          // Get list of direct report IDs
          const { data: directReports, error: directReportsError } = await supabase
            .from('profiles')
            .select('id')
            .eq('manager_id', profile.id);
            
          if (directReportsError) throw directReportsError;
          
          const directReportIds = directReports.map(dr => dr.id);
          
          // Filter bulletins to only include those created by direct reports or the manager
          filteredBulletinsData = bulletinsData.filter(bulletin => 
            bulletin.created_by === profile.id || directReportIds.includes(bulletin.created_by)
          );
        }
      }

      // Create a map of user IDs to their profile information
      const profileMap = profiles.reduce((acc, profile) => {
        acc[profile.id] = profile;
        return acc;
      }, {} as Record<string, any>);

      // Merge the bulletins with their creator's profile information
      return filteredBulletinsData.map((bulletin) => ({
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
