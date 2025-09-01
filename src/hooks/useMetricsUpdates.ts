import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MetricCount, MetricType } from "@/types/metrics";

export const useMetricsUpdates = (
  metrics: MetricCount,
  handleInputChange: (metric: MetricType, value: string) => void
) => {
  const { toast } = useToast();

  const updateMetric = (metric: MetricType, increment: boolean) => {
    const currentValue = metrics[metric];
    const newValue = increment
      ? metric === "ap"
        ? currentValue + 100
        : currentValue + 1
      : metric === "ap"
      ? Math.max(0, currentValue - 100)
      : Math.max(0, currentValue - 1);

    console.log("[MetricsUpdates] Updating metric:", {
      action: "update_metric",
      metric,
      currentValue,
      newValue,
      increment,
      allMetrics: { ...metrics },
      timestamp: new Date().toISOString(),
    });

    handleInputChange(metric, newValue.toString());

    toast({
      title: "Metric Updated",
      description: `${metric.toUpperCase()} has been ${increment ? "increased" : "decreased"}`,
    });
  };

  const saveDailyMetrics = async () => {
    try {
      const timestamp = Date.now();
      const formattedDate = new Date(timestamp).toISOString().split("T")[0];
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { error, data } = await supabase
        .from("daily_metrics")
        .upsert(
          {
            user_id: user.user.id,
            date: formattedDate,
            ...metrics,
          },
          {
            onConflict: "user_id,date",
          }
        )
        .select();

      if (error) throw error;

      console.log("[MetricsUpdates] Metrics saved successfully:", {
        action: "save_success",
        saved: metrics,
        response: data,
        timestamp,
      });

      toast({
        title: "Success",
        description: "Today's metrics have been saved to history",
      });
    } catch (error) {
      console.error("[MetricsUpdates] Error saving daily metrics:", {
        action: "save_error",
        error,
        metrics: { ...metrics },
        timestamp: Date.now(),
      });
      toast({
        title: "Error",
        description: "Failed to save today's metrics",
        variant: "destructive",
      });
    }
  };

  return {
    updateMetric,
    saveDailyMetrics,
  };
};
