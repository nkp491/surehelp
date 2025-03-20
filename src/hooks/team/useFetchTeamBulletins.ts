
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TeamBulletin, BulletinReadReceipt } from "@/types/team";

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

      // Fetch read receipts for all bulletins
      const bulletinIds = bulletinsData.map(bulletin => bulletin.id);
      
      // Only fetch read receipts if there are bulletins
      let receiptsByBulletin: Record<string, BulletinReadReceipt[]> = {};
      
      if (bulletinIds.length > 0) {
        const { data: readReceipts, error: receiptsError } = await supabase
          .from('bulletin_read_receipts')
          .select(`
            id, 
            bulletin_id, 
            user_id, 
            read_at
          `)
          .in('bulletin_id', bulletinIds);
        
        if (receiptsError) throw receiptsError;

        // Get profiles for users who read the bulletins
        const readerIds = readReceipts.map(receipt => receipt.user_id);
        let readerProfiles: Record<string, any> = {};
        
        if (readerIds.length > 0) {
          const { data: userProfiles, error: userProfilesError } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, profile_image_url')
            .in('id', readerIds);
          
          if (userProfilesError) throw userProfilesError;
          
          readerProfiles = userProfiles.reduce((acc, profile) => {
            acc[profile.id] = profile;
            return acc;
          }, {} as Record<string, any>);
        }

        // Group read receipts by bulletin ID
        receiptsByBulletin = {};
        
        if (readReceipts) {
          readReceipts.forEach((receipt) => {
            const bulletinId = receipt.bulletin_id;
            if (!receiptsByBulletin[bulletinId]) {
              receiptsByBulletin[bulletinId] = [];
            }
            
            const profile = readerProfiles[receipt.user_id] || {};
            
            receiptsByBulletin[bulletinId].push({
              user_id: receipt.user_id,
              user_name: profile ? 
                `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 
                'Unknown',
              user_image: profile?.profile_image_url,
              read_at: receipt.read_at
            });
          });
        }
      }

      // Merge the bulletins with their creator's profile information and read receipts
      return bulletinsData.map((bulletin) => ({
        ...bulletin,
        author_name: profileMap[bulletin.created_by] ? 
          `${profileMap[bulletin.created_by].first_name || ''} ${profileMap[bulletin.created_by].last_name || ''}`.trim() : 
          'Unknown',
        author_image: profileMap[bulletin.created_by]?.profile_image_url,
        read_receipts: receiptsByBulletin[bulletin.id] || []
      })) as TeamBulletin[];
    },
    enabled: !!teamId,
  });
};
