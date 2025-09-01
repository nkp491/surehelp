import { useState, useEffect, useCallback } from 'react';
import { useMetricsLoad } from './metrics/useMetricsLoad';
import { useMetricsSort } from './metrics/useMetricsSort';
import { useMetricsEdit } from './metrics/useMetricsEdit';
import { useMetricsBackdate } from './metrics/useMetricsBackdate';
import { MetricCount } from '@/types/metrics';
import { useToast } from '@/hooks/use-toast';

export const useMetricsHistory = () => {
  const { history, loadHistory, addOptimisticEntry, isLoading, loadMoreHistory, updateOptimisticEntry } = useMetricsLoad();
  const { sortedHistory, handleSort } = useMetricsSort(history);
  
  // Create optimistic update callback
  const handleOptimisticEdit = useCallback((date: string, newValues: MetricCount) => {
    updateOptimisticEntry(date, newValues);
  }, [updateOptimisticEntry]);
  
  const {
    editingRow,
    editedValues,
    handleEdit,
    handleSave,
    handleCancel,
    handleValueChange,
  } = useMetricsEdit(handleOptimisticEdit);
  const { toast } = useToast();

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { handleAddBackdatedMetrics } = useMetricsBackdate(addOptimisticEntry);

  // Create a memoized version of handleAddBackdatedMetrics wrapper
  const handleAddMetrics = useCallback(async (date: Date) => {
    if (!date) {
      toast({
        title: "Error",
        description: "Please select a date",
        variant: "destructive",
      });
      return;
    }

    console.log('[useMetricsHistory] Adding metrics for date:', date);
    try {
      await handleAddBackdatedMetrics(date, async () => {
        console.log('[useMetricsHistory] Reloading history after add');
        await loadHistory();
      });
      
      // Reset the selected date after successful addition
      setSelectedDate(null);
      
      toast({
        title: "Success",
        description: "Historical entry added successfully",
      });
    } catch (error) {
      console.error('[useMetricsHistory] Error adding metrics:', error);
      toast({
        title: "Error",
        description: "Failed to add historical entry",
        variant: "destructive",
      });
    }
  }, [handleAddBackdatedMetrics, loadHistory, toast]);

  const validateMetrics = useCallback((metrics: MetricCount) => {
    // Add validation logic here if needed
    return { isValid: true, errors: {} };
  }, []);

  const calculateTrends = useCallback((current: MetricCount, previous: MetricCount) => {
    // Add trend calculation logic here if needed
    return {};
  }, []);

  // Ensure history is loaded on mount
  useEffect(() => {
    console.log('[useMetricsHistory] Loading initial history');
    loadHistory();
  }, [loadHistory]);

  // Debug logging for history data
  useEffect(() => {
    console.log('[useMetricsHistory] History data updated:', {
      historyLength: history.length,
      sortedHistoryLength: sortedHistory?.length || 0,
      isLoading,
      hasData: history.length > 0
    });
  }, [history, sortedHistory, isLoading]);

  return {
    sortedHistory,
    editingRow,
    editedValues,
    selectedDate,
    setSelectedDate,
    handleAddBackdatedMetrics: handleAddMetrics,
    handleSort,
    handleEdit,
    handleSave,
    handleCancel,
    handleValueChange,
    loadHistory,
    isLoading,
    loadMoreHistory,
    validateMetrics,
    calculateTrends,
  };
};