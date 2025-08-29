import { useState } from "react";
import { MetricCount } from "@/types/metrics";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export const useMetricsEdit = () => {
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editedValues, setEditedValues] = useState<MetricCount | null>(null);
  const { toast } = useToast();

  const handleEdit = (date: string, metrics: MetricCount) => {
    setEditingRow(date);
    setEditedValues({ ...metrics });
  };

  const handleSave = async (date: string, onSuccess?: () => void) => {
    if (!editedValues) return;

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const timestamp = Date.now();
      const formattedDate = new Date(timestamp).toISOString().split("T")[0];

      // Process values before saving
      const processedValues = Object.entries(editedValues).reduce(
        (acc, [key, value]) => ({
          ...acc,
          [key]: Math.round(Number(value)),
        }),
        {} as MetricCount
      );

      console.log("[MetricsEdit] Saving metrics:", {
        action: "update_metrics",
        date: formattedDate,
        metrics: processedValues,
        timestamp,
      });

      const { error } = await supabase
        .from("daily_metrics")
        .update(processedValues)
        .eq("date", date)
        .eq("user_id", user.user.id);

      if (error) throw error;

      console.log("[MetricsEdit] Metrics updated successfully:", {
        action: "update_success",
        date: formattedDate,
        metrics: processedValues,
        timestamp,
      });

      // Create a more detailed success message showing what was updated
      const updatedMetrics = Object.entries(processedValues)
        .filter(([_, value]) => value > 0)
        .map(([metric, value]) => {
          const displayValue =
            metric === "ap" ? `$${value.toLocaleString()}` : value.toString();
          return `${metric.toUpperCase()}: ${displayValue}`;
        })
        .join(", ");

      const successMessage = updatedMetrics
        ? `Updated ${updatedMetrics} for ${format(
            new Date(date),
            "MMM dd, yyyy"
          )}`
        : `KPI data for ${format(
            new Date(date),
            "MMM dd, yyyy"
          )} has been updated successfully.`;

      toast({
        title: "Success!",
        description: successMessage,
      });

      setEditingRow(null);
      setEditedValues(null);

      // Call the success callback if provided
      onSuccess?.();

      // Return success to indicate the operation completed
      return true;
    } catch (error) {
      console.error("[MetricsEdit] Error updating metrics:", {
        action: "update_error",
        error,
        metrics: editedValues,
        timestamp: Date.now(),
      });
      toast({
        title: "Error",
        description: "Failed to update KPI data. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleCancel = () => {
    setEditingRow(null);
    setEditedValues(null);
  };

  const handleValueChange = (metric: keyof MetricCount, value: string) => {
    if (!editedValues) return;

    setEditedValues((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [metric]: metric === "ap" ? Math.round(Number(value)) : Number(value),
      };
    });
  };

  return {
    editingRow,
    editedValues,
    handleEdit,
    handleSave,
    handleCancel,
    handleValueChange,
  };
};
