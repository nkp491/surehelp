import { useMetricsLoad } from './metrics/useMetricsLoad';
import { useMetricsSort } from './metrics/useMetricsSort';
import { useMetricsEdit } from './metrics/useMetricsEdit';
import { useMetricsBackdate } from './metrics/useMetricsBackdate';

export const useMetricsHistory = () => {
  const { history, loadHistory } = useMetricsLoad();
  const { sortedHistory, handleSort } = useMetricsSort(history);
  const {
    editingRow,
    editedValues,
    handleEdit,
    handleSave,
    handleCancel,
    handleValueChange,
  } = useMetricsEdit();
  const {
    selectedDate,
    setSelectedDate,
    handleAddBackdatedMetrics,
  } = useMetricsBackdate();

  return {
    sortedHistory,
    editingRow,
    editedValues,
    selectedDate,
    setSelectedDate,
    handleAddBackdatedMetrics,
    handleSort,
    handleEdit,
    handleSave,
    handleCancel,
    handleValueChange,
  };
};