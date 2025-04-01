
import { Profile } from "@/types/profile";
import { supabase } from "@/integrations/supabase/client";

/**
 * Filter bulletins based on direct reports access
 */
export const useDirectReportsFilter = () => {
  const isHigherTierManager = (profile?: Profile | null): boolean => {
    // Check if user is higher tier manager (gold or platinum)
    return (
      !!profile?.roles?.some(
        (r) => r === "manager_pro_gold" || r === "manager_pro_platinum"
      ) ||
      profile?.role === "manager_pro_gold" ||
      profile?.role === "manager_pro_platinum"
    );
  };

  const getDirectReportIds = async (managerId: string): Promise<string[]> => {
    // Get list of direct report IDs
    const { data: directReports, error: directReportsError } = await supabase
      .from("profiles")
      .select("id")
      .eq("manager_id", managerId);

    if (directReportsError) throw directReportsError;
    return directReports.map((dr) => dr.id);
  };

  return {
    isHigherTierManager,
    getDirectReportIds
  };
};
