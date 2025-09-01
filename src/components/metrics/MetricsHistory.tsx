import { useState, useEffect } from "react";
import { useMetricsHistory } from "@/hooks/useMetricsHistory";
import { useMetricsDelete } from "@/hooks/metrics/useMetricsDelete";
import MetricsHistoryHeader from "./filters/MetricsHistoryHeader";
import MetricsContent from "./MetricsContent";
import { useMetrics } from "@/contexts/MetricsContext";
import { TimePeriod } from "@/types/metrics";
import { useInView } from "react-intersection-observer";

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

  // Track if we've reached the end of available data
  const [hasMoreData, setHasMoreData] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Infinite scroll setup with a lower threshold for smoother loading
  const { ref, inView } = useInView({
    threshold: 0.1,
    rootMargin: "100px",
    // Disable when no more data
    skip: !hasMoreData,
  });

  useEffect(() => {
    console.log("[MetricsHistory] useEffect triggered:", {
      inView,
      isLoading,
      isLoadingMore,
      hasMoreData,
    });
    if (inView && !isLoading && !isLoadingMore && hasMoreData) {
      console.log("[MetricsHistory] Calling loadMoreHistory");
      setIsLoadingMore(true);
      loadMoreHistory()
        .then((result) => {
          console.log("[MetricsHistory] loadMoreHistory result:", result);
          if (result && !result.hasMore) {
            console.log("[MetricsHistory] Setting hasMoreData to false");
            setHasMoreData(false);
          }
          setIsLoadingMore(false);
        })
        .catch(() => {
          setIsLoadingMore(false);
        });
    }
  }, [inView, isLoading, isLoadingMore, hasMoreData]);

  const handleSaveAndRefresh = async (date: string) => {
    await handleSave(date);
    await loadHistory();
    await refreshMetrics();
    // Reset hasMoreData when refreshing history
    setHasMoreData(true);
  };

  const handleAddHistoricalEntry = async (date: Date) => {
    try {
      await handleAddBackdatedMetrics(date);
      await refreshMetrics();
      // Reset hasMoreData when adding new entries
      setHasMoreData(true);
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

      <div className="bg-white rounded-lg shadow-sm">
        {isLoading && sortedHistory.length === 0 ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading KPI history...</p>
          </div>
        ) : (
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
        )}
      </div>

      {/* Infinite scroll trigger and end-of-data indicator */}
      {hasMoreData ? (
        <div ref={ref} className="h-4">
          {isLoadingMore && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">
                Loading more...
              </p>
            </div>
          )}
        </div>
      ) : (
        sortedHistory.length > 0 && (
          <div className="text-center py-4 text-muted-foreground">
            <p>No more historical data to load</p>
          </div>
        )
      )}
    </div>
  );
};

export default MetricsHistory;
