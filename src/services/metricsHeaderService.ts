import { supabase } from "@/integrations/supabase/client";

export interface MetricsHeaderData {
  leads: number;
  calls: number;
  contacts: number;
  scheduled: number;
  sits: number;
  sales: number;
  ap: number;
}

export const saveTodayMetricsForHeader = async (
  metrics: MetricsHeaderData
): Promise<boolean> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      console.error("[MetricsHeader] No user found");
      return false;
    }
    const { error } = await supabase
      .from("daily_metrics")
      .insert({
        user_id: user.user.id,
        leads: metrics.leads,
        calls: metrics.calls,
        contacts: metrics.contacts,
        scheduled: metrics.scheduled,
        sits: metrics.sits,
        sales: metrics.sales,
        ap: metrics.ap,
      })
      .select()
      .single();
    if (error) {
      console.error("[MetricsHeader] Error saving metrics:", error);
      return false;
    }
    console.log("[MetricsHeader] Successfully saved today's metrics:", metrics);
    return true;
  } catch (error) {
    console.error("[MetricsHeader] Unexpected error saving metrics:", error);
    return false;
  }
};
