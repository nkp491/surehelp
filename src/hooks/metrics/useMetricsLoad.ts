import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MetricCount } from "@/types/metrics";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, subMonths } from "date-fns";

// Create a singleton for the channel
let globalChannel: ReturnType<typeof supabase.channel> | null = null;

export const useMetricsLoad = () => {
  const [history, setHistory] = useState<Array<{ date: string; metrics: MetricCount }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const isSubscribed = useRef(false);

  const loadHistory = useCallback(
    async (retryCount = 0) => {
      try {
        setIsLoading(true);
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) {
          return [];
        }

        // Add a small delay on retry attempts
        if (retryCount > 0) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }

        // Get data from the last 3 months by default
        const threeMonthsAgo = format(subMonths(new Date(), 3), "yyyy-MM-dd");

        const { data, error } = await supabase
          .from("daily_metrics")
          .select("*")
          .eq("user_id", user.user.id)
          .gte("date", threeMonthsAgo)
          .order("date", { ascending: false });

        if (error) {
          console.error("[MetricsLoad] Error fetching data:", error);
          throw error;
        }

        const formattedHistory = data.map((entry) => ({
          date: format(parseISO(entry.date), "yyyy-MM-dd"),
          metrics: {
            leads: entry.leads || 0,
            calls: entry.calls || 0,
            contacts: entry.contacts || 0,
            scheduled: entry.scheduled || 0,
            sits: entry.sits || 0,
            sales: entry.sales || 0,
            ap: entry.ap || 0,
          },
        }));

        setHistory(formattedHistory);
        return formattedHistory;
      } catch (error) {
        console.error("[MetricsLoad] Error loading history:", error);
        if (retryCount < 2) {
          return loadHistory(retryCount + 1);
        }
        toast({
          title: "Error",
          description: "Failed to load metrics history",
          variant: "destructive",
        });
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  const loadMoreHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data: user } = await supabase.auth.getUser();
      if (!user.user || history.length === 0) return;

      const oldestEntry = history[history.length - 1];
      const { data, error } = await supabase
        .from("daily_metrics")
        .select("*")
        .eq("user_id", user.user.id)
        .lt("date", oldestEntry.date)
        .order("date", { ascending: false })
        .limit(20);

      if (error) throw error;

      const formattedNewHistory = data.map((entry) => ({
        date: format(parseISO(entry.date), "yyyy-MM-dd"),
        metrics: {
          leads: entry.leads || 0,
          calls: entry.calls || 0,
          contacts: entry.contacts || 0,
          scheduled: entry.scheduled || 0,
          sits: entry.sits || 0,
          sales: entry.sales || 0,
          ap: entry.ap || 0,
        },
      }));

      setHistory((prev) => [...prev, ...formattedNewHistory]);
      return formattedNewHistory;
    } catch (error) {
      console.error("[MetricsLoad] Error loading more history:", error);
      toast({
        title: "Error",
        description: "Failed to load more history",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [history, toast]);

  const addOptimisticEntry = useCallback((date: string, metrics: MetricCount) => {
    setHistory((prev) => {
      const newEntry = { date, metrics };
      const existingIndex = prev.findIndex((entry) => entry.date === date);

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = newEntry;
        return updated;
      } else {
        const updated = [newEntry, ...prev];
        return updated.slice(0, 100); // Keep only the most recent 100 entries in memory
      }
    });
  }, []);

  useEffect(() => {
    console.log("[MetricsLoad] Initial load starting...");
    loadHistory();
    if (!isSubscribed.current && !globalChannel) {
      globalChannel = supabase
        .channel("metrics-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "daily_metrics",
            filter: `date=gte.${format(subMonths(new Date(), 1), "yyyy-MM-dd")}`,
          },
          async (payload) => {
            console.log("[MetricsLoad] Real-time update received:", payload);
            await loadHistory();
          }
        )
        .subscribe();

      isSubscribed.current = true;
    }

    return () => {
      if (isSubscribed.current && globalChannel) {
        console.log("[MetricsLoad] Cleaning up subscription");
        supabase.removeChannel(globalChannel);
        globalChannel = null;
        isSubscribed.current = false;
      }
    };
  }, []);

  return {
    history,
    isLoading,
    loadHistory,
    loadMoreHistory,
    addOptimisticEntry,
  };
};
