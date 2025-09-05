import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useMetricsRealtime = (metrics: Record<string, number>) => {
  useEffect(() => {
    const channel = supabase
      .channel("metrics-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "daily_metrics",
        },
        () => {
          const refreshEvent = new CustomEvent("refreshMetricsHistory");
          window.dispatchEvent(refreshEvent);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [metrics]);
};
