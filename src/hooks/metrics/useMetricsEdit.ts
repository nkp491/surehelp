import { useState } from "react";
import { MetricCount } from "@/types/metrics";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useMetricsEdit = (onSuccessfulEdit?: (date: string, newValues: MetricCount) => void) => {
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editedValues, setEditedValues] = useState<MetricCount | null>(null);
  const { toast } = useToast();

  const handleEdit = (date: string, metrics: MetricCount) => {
    setEditingRow(date);
    setEditedValues({ ...metrics });
  };

  const handleSave = async (date: string) => {
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

      toast({
        title: "Success",
        description: "Metrics updated successfully",
      });

      // Call the callback to update the UI immediately with optimistic updates
      if (onSuccessfulEdit) {
        onSuccessfulEdit(date, processedValues);
      }

      setEditingRow(null);
      setEditedValues(null);
    } catch (error) {
      console.error("[MetricsEdit] Error updating metrics:", {
        action: "update_error",
        error,
        metrics: editedValues,
        timestamp: Date.now(),
      });
      toast({
        title: "Error",
        description: "Failed to update metrics",
        variant: "destructive",
      });
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
