
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
      const { data: readReceipts, error: receiptsError } = await supabase
        .from('bulletin_read_receipts')
        .select(`
          id, 
          bulletin_id, 
          user_id, 
          read_at,
          profiles:user_id (
            id, first_name, last_name, profile_image_url
          )
        `)
        .in('bulletin_id', bulletinIds);
      
      if (receiptsError) throw receiptsError;

      // Group read receipts by bulletin ID
      const receiptsByBulletin: Record<string, BulletinReadReceipt[]> = {};
      readReceipts.forEach((receipt: any) => {
        const bulletinId = receipt.bulletin_id;
        if (!receiptsByBulletin[bulletinId]) {
          receiptsByBulletin[bulletinId] = [];
        }
        
        receiptsByBulletin[bulletinId].push({
          user_id: receipt.user_id,
          user_name: receipt.profiles ? 
            `${receipt.profiles.first_name || ''} ${receipt.profiles.last_name || ''}`.trim() : 
            'Unknown',
          user_image: receipt.profiles?.profile_image_url,
          read_at: receipt.read_at
        });
      });

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
