import { useCallback } from "react";
import { useMetrics } from "@/contexts/MetricsContext";

export const useMetricsRefresh = () => {
  const { refreshMetrics } = useMetrics();

  const refreshMetricsAfterFormSubmission = useCallback(async () => {
    try {
      await refreshMetrics();
    } catch (error) {
      console.error("Error refreshing metrics after form submission:", error);
    }
  }, [refreshMetrics]);

  return { refreshMetricsAfterFormSubmission };
};
