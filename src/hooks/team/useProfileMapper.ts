
import { TeamBulletin } from "@/types/team";

/**
 * Helper hook to map profiles to bulletins
 */
export const useProfileMapper = () => {
  const mapProfilesToButtetins = (
    bulletinsData: any[], 
    profileMap: Record<string, any>
  ): TeamBulletin[] => {
    // Merge the bulletins with their creator's profile information
    return bulletinsData.map((bulletin) => ({
      ...bulletin,
      author_name: profileMap[bulletin.created_by]
        ? `${profileMap[bulletin.created_by].first_name || ""} ${
            profileMap[bulletin.created_by].last_name || ""
          }`.trim()
        : "Unknown",
      author_image: profileMap[bulletin.created_by]?.profile_image_url,
    })) as TeamBulletin[];
  };

  return {
    mapProfilesToButtetins,
  };
};
