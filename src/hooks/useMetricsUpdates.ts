import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MetricCount, MetricType } from "@/types/metrics";

export const useMetricsUpdates = (
  metrics: MetricCount,
  handleInputChange: (metric: MetricType, value: string) => void
) => {
  const { toast } = useToast();

  const incrementMetric = (metric: MetricType) => {
    const currentValue = metrics[metric];
    const newValue = metric === "ap" ? currentValue + 100 : currentValue + 1;

    handleInputChange(metric, newValue.toString());

    toast({
      title: "Metric Updated",
      description: `${metric.toUpperCase()} has been increased`,
    });
  };

  const decrementMetric = (metric: MetricType) => {
    const currentValue = metrics[metric];
    const newValue =
      metric === "ap"
        ? Math.max(0, currentValue - 100)
        : Math.max(0, currentValue - 1);

    handleInputChange(metric, newValue.toString());

    toast({
      title: "Metric Updated",
      description: `${metric.toUpperCase()} has been decreased`,
    });
  };

  const saveDailyMetrics = async () => {
    try {
      // Validate that at least one metric has a value greater than 0
      const hasValidMetrics = Object.values(metrics).some((value) => value > 0);
      if (!hasValidMetrics) {
        toast({
          title: "No Metrics to Log",
          description: "Please add at least 1 metric before logging",
          variant: "destructive",
        });
        return;
      }

      const timestamp = Date.now();
      const formattedDate = new Date(timestamp).toISOString().split("T")[0];
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { error } = await supabase
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
    incrementMetric,
    decrementMetric,
    saveDailyMetrics,
  };
};
