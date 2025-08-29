import { Table, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { format } from "date-fns";
import { MetricCount } from "@/types/metrics";
import MetricsTableHeader from "./MetricsTableHeader";
import EditableMetricCell from "./EditableMetricCell";
import MetricRowActions from "./MetricRowActions";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar, Plus } from "lucide-react";
import React from "react";

interface MetricsTableProps {
  history: Array<{ date: string; metrics: MetricCount }>;
  editingRow: string | null;
  editedValues: MetricCount | null;
  onEdit: (date: string, metrics: MetricCount) => void;
  onSave: (date: string) => void;
  onCancel: () => void;
  onSort: (key: string) => void;
  onValueChange: (metric: keyof MetricCount, value: string) => void;
  onDelete: (date: string) => void;
}

const ITEMS_PER_PAGE = 20;

const MetricsTable = ({
  history,
  editingRow,
  editedValues,
  onEdit,
  onSave,
  onCancel,
  onSort,
  onValueChange,
  onDelete,
}: MetricsTableProps) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [savingRow, setSavingRow] = React.useState<string | null>(null);
  const [successRow, setSuccessRow] = React.useState<string | null>(null);
  const totalPages = Math.ceil(history.length / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPageData = history.slice(startIndex, endIndex);

  const handleSave = async (date: string) => {
    setSavingRow(date);
    try {
      await onSave(date);
      setSuccessRow(date);
      setTimeout(() => setSuccessRow(null), 2000);
    } finally {
      setSavingRow(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    if (editingRow) {
      onCancel();
    }
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <Table>
          <MetricsTableHeader onSort={onSort} />
          <TableBody>
            {currentPageData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center space-y-4 py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground/50" />
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium text-muted-foreground">
                        No KPI data found
                      </h3>
                      <p className="text-sm text-muted-foreground max-w-sm">
                        {history.length === 0 
                          ? "Start tracking your performance by adding your first KPI entry."
                          : "No data matches your current filters. Try adjusting your search or date selection."
                        }
                      </p>
                    </div>
                    {history.length === 0 && (
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Plus className="h-4 w-4" />
                        <span>Use the "Add Historical Entry" button above to get started</span>
                      </div>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              currentPageData.map(({ date, metrics }) => {
                const currentValues =
                  editingRow === date ? editedValues : metrics;
                const isSaving = savingRow === date;
                const isSuccess = successRow === date;

                const getRowClassName = () => {
                  if (isSaving) return "opacity-75 bg-blue-50";
                  if (isSuccess) return "bg-green-50";
                  return "";
                };

                return (
                  <TableRow key={date} className={getRowClassName()}>
                    <EditableMetricCell
                      isEditing={false}
                      value={format(new Date(date), "MMM dd, yyyy")}
                      onChange={() => {}}
                      metric="date"
                    />
                    {Object.entries(metrics).map(([metric, _]) => (
                      <EditableMetricCell
                        key={metric}
                        isEditing={editingRow === date}
                        value={
                          currentValues
                            ? currentValues[
                                metric as keyof MetricCount
                              ].toString()
                            : "0"
                        }
                        onChange={(newValue) =>
                          onValueChange(metric as keyof MetricCount, newValue)
                        }
                        metric={metric}
                      />
                    ))}
                    <MetricRowActions
                      isEditing={editingRow === date}
                      isSaving={isSaving}
                      onEdit={() => onEdit(date, metrics)}
                      onSave={() => handleSave(date)}
                      onCancel={onCancel}
                      onDelete={() => onDelete(date)}
                    />
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetricsTable;
