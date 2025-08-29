import { useState, useEffect } from "react";
import { useMetricsHistory } from "@/hooks/useMetricsHistory";
import { useMetricsDelete } from "@/hooks/metrics/useMetricsDelete";
import MetricsHistoryHeader from "./filters/MetricsHistoryHeader";
import MetricsContent from "./MetricsContent";
import { useMetrics } from "@/contexts/MetricsContext";
import { TimePeriod } from "@/types/metrics";
import { useInView } from "react-intersection-observer";
import { Loader2 } from "lucide-react";

const MetricsHistory = () => {
  const {
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
    loadHistory,
    isLoading,
    loadMoreHistory,
  } = useMetricsHistory();

  const { refreshMetrics } = useMetrics();
  const [searchTerm, setSearchTerm] = useState("");
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("24h");
  const { deleteDate, setDeleteDate, handleDelete } =
    useMetricsDelete(loadHistory);

  // Infinite scroll setup with a lower threshold for smoother loading
  const { ref, inView } = useInView({
    threshold: 0.1,
    rootMargin: "100px",
  });

  useEffect(() => {
    if (inView && !isLoading) {
      loadMoreHistory();
    }
  }, [inView, isLoading, loadMoreHistory]);

  const handleSaveAndRefresh = async (date: string) => {
    try {
      const success = await handleSave(date, async () => {
        // Immediately refresh the data to show updated values
        await Promise.all([loadHistory(), refreshMetrics()]);
      });

      if (!success) {
        console.error("[MetricsHistory] Save operation failed");
      }
    } catch (error) {
      console.error("[MetricsHistory] Error in save and refresh:", error);
    }
  };

  const handleAddHistoricalEntry = async (date: Date) => {
    try {
      await handleAddBackdatedMetrics(date);
      await refreshMetrics();
    } catch (error) {
      console.error("[MetricsHistory] Error adding historical entry:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <MetricsHistoryHeader
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          onAdd={handleAddHistoricalEntry}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          timePeriod={timePeriod}
          onTimePeriodChange={setTimePeriod}
        />
      </div>

      {isLoading ? (
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {sortedHistory.length === 0
                  ? "Loading KPI history..."
                  : "Loading more data..."}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm">
          <MetricsContent
            sortedHistory={sortedHistory}
            editingRow={editingRow}
            editedValues={editedValues}
            selectedDate={selectedDate}
            searchTerm={searchTerm}
            deleteDate={deleteDate}
            onEdit={handleEdit}
            onSave={handleSaveAndRefresh}
            onCancel={handleCancel}
            onSort={handleSort}
            onValueChange={handleValueChange}
            onDelete={(date) => setDeleteDate(date)}
            onDeleteDialogChange={(open) => !open && setDeleteDate(null)}
            onConfirmDelete={() => deleteDate && handleDelete(deleteDate)}
          />
        </div>
      )}

      {/* Loading indicator for infinite scroll */}
      {isLoading && sortedHistory.length > 0 && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Invisible trigger for infinite scroll */}
      <div ref={ref} className="h-4" />
    </div>
  );
};

export default MetricsHistory;
