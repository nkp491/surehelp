import { useState, useEffect } from "react";
import { useMetricsHistory } from "@/hooks/useMetricsHistory";
import { useMetricsDelete } from "@/hooks/metrics/useMetricsDelete";
import MetricsHistoryHeader from "./filters/MetricsHistoryHeader";
import MetricsContent from "./MetricsContent";
import { useMetrics } from "@/contexts/MetricsContext";
import { useInView } from "react-intersection-observer";

const MetricsHistory = () => {
  const {
    sortedHistory,
    editingRow,
    editedValues,
    selectedDate,
    setSelectedDate,
    handleAddBackdatedMetrics,
    handleEdit,
    handleSave,
    handleCancel,
    handleValueChange,
    loadHistory,
    isLoading,
    loadMoreHistory,
  } = useMetricsHistory();

  const { refreshMetrics } = useMetrics();
  const { deleteDate, setDeleteDate, handleDelete } =
    useMetricsDelete(loadHistory);

  // Track if we've reached the end of available data
  const [hasMoreData, setHasMoreData] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Check if we should enable infinite scroll (more than 20 entries)
  const shouldEnableInfiniteScroll = sortedHistory.length >= 20;

  // Infinite scroll setup - only enable when we have 20+ entries
  const { ref, inView } = useInView({
    threshold: 0.1,
    rootMargin: "100px",
    // Only enable infinite scroll when we have 20+ entries
    skip: !shouldEnableInfiniteScroll || !hasMoreData,
  });

  // Auto-load more when scrolling to bottom (only if we have 20+ entries)
  useEffect(() => {
    if (
      inView &&
      !isLoading &&
      !isLoadingMore &&
      hasMoreData &&
      shouldEnableInfiniteScroll
    ) {
      setIsLoadingMore(true);
      loadMoreHistory()
        .then((result) => {
          if (result && !result.hasMore) {
            setHasMoreData(false);
          }
          setIsLoadingMore(false);
        })
        .catch(() => {
          setIsLoadingMore(false);
        });
    }
  }, [
    inView,
    isLoading,
    isLoadingMore,
    hasMoreData,
    shouldEnableInfiniteScroll,
    loadMoreHistory,
  ]);

  // Manual load more function for when we have less than 20 entries
  const handleLoadMore = async () => {
    if (
      !isLoading &&
      !isLoadingMore &&
      hasMoreData &&
      !shouldEnableInfiniteScroll
    ) {
      setIsLoadingMore(true);
      try {
        const result = await loadMoreHistory();
        if (result && !result.hasMore) {
          setHasMoreData(false);
        }
      } catch (error) {
        console.error("Error loading more data:", error);
      } finally {
        setIsLoadingMore(false);
      }
    }
  };

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
      <MetricsHistoryHeader
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        onAdd={handleAddHistoricalEntry}
      />
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
            deleteDate={deleteDate}
            onEdit={handleEdit}
            onSave={handleSaveAndRefresh}
            onCancel={handleCancel}
            onValueChange={handleValueChange}
            onDelete={(date) => setDeleteDate(date)}
            onDeleteDialogChange={(open) => !open && setDeleteDate(null)}
            onConfirmDelete={() => deleteDate && handleDelete(deleteDate)}
          />
        )}
      </div>

      {/* Loading indicators and end-of-data indicator */}
      {hasMoreData ? (
        <div>
          {shouldEnableInfiniteScroll ? (
            // Infinite scroll loading indicator
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
            // Manual load more button for less than 20 entries
            <div className="flex justify-center py-4">
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingMore ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Loading more...</span>
                  </div>
                ) : (
                  "Load More History"
                )}
              </button>
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
