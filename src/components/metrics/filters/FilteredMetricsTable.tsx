import { MetricCount } from "@/types/metrics";
import MetricsTable from "../MetricsTable";
import { format, parseISO, isSameDay, startOfDay } from "date-fns";

interface FilteredMetricsTableProps {
  history: Array<{ date: string; metrics: MetricCount }>;
  editingRow: string | null;
  editedValues: MetricCount | null;
  onEdit: (date: string, metrics: MetricCount) => void;
  onSave: (date: string) => void;
  onCancel: () => void;
  onSort: (key: string) => void;
  onValueChange: (metric: keyof MetricCount, value: string) => void;
  onDelete: (date: string) => void;
  searchTerm: string;
  selectedDate: Date | undefined;
}

const FilteredMetricsTable = ({
  history,
  editingRow,
  editedValues,
  onEdit,
  onSave,
  onCancel,
  onSort,
  onValueChange,
  onDelete,
  searchTerm,
  selectedDate,
}: FilteredMetricsTableProps) => {
  console.log('[FilteredMetricsTable] Filtering history:', {
    originalCount: history.length,
    originalDates: history.map(h => ({
      date: h.date,
      parsed: parseISO(h.date).toISOString()
    })),
    searchTerm,
    selectedDate: selectedDate?.toISOString()
  });

  const filteredHistory = history.filter(item => {
    // Search term matching
    const matchesSearch = Object.values(item.metrics).some(value => 
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    ) || item.date.toLowerCase().includes(searchTerm.toLowerCase());

    // Date matching - use isSameDay for comparison
    const matchesDate = !selectedDate || isSameDay(parseISO(item.date), selectedDate);

    const result = matchesSearch && matchesDate;

    console.log('[FilteredMetricsTable] Filtering entry:', {
      date: item.date,
      parsedDate: parseISO(item.date).toISOString(),
      selectedDate: selectedDate ? selectedDate.toISOString() : null,
      matchesSearch,
      matchesDate,
      result
    });

    return result;
  });

  console.log('[FilteredMetricsTable] Filtered results:', {
    filteredCount: filteredHistory.length,
    filteredDates: filteredHistory.map(h => ({
      date: h.date,
      parsed: parseISO(h.date).toISOString()
    }))
  });

  return (
    <MetricsTable
      history={filteredHistory}
      editingRow={editingRow}
      editedValues={editedValues}
      onEdit={onEdit}
      onSave={onSave}
      onCancel={onCancel}
      onSort={onSort}
      onValueChange={onValueChange}
      onDelete={onDelete}
    />
  );
};

export default FilteredMetricsTable;