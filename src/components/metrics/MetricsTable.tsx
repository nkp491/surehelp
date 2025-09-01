import { Table, TableBody, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';
import { MetricCount } from "@/types/metrics";
import MetricsTableHeader from "./MetricsTableHeader";
import EditableMetricCell from "./EditableMetricCell";
import MetricRowActions from "./MetricRowActions";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  const totalPages = Math.ceil(history.length / ITEMS_PER_PAGE);
  
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPageData = history.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    // If we're editing and change pages, cancel the edit
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
            {currentPageData.map(({ date, metrics }) => {
              const currentValues = editingRow === date ? editedValues : metrics;
              
              return (
                <TableRow key={date}>
                  <EditableMetricCell
                    isEditing={false}
                    value={format(new Date(date), 'MMM dd, yyyy')}
                    onChange={() => {}}
                    metric="date"
                  />
                  {Object.entries(metrics).map(([metric, _]) => (
                    <EditableMetricCell
                      key={metric}
                      isEditing={editingRow === date}
                      value={currentValues ? currentValues[metric as keyof MetricCount].toString() : '0'}
                      onChange={(newValue) => onValueChange(metric as keyof MetricCount, newValue)}
                      metric={metric}
                    />
                  ))}
                  <MetricRowActions
                    isEditing={editingRow === date}
                    onEdit={() => onEdit(date, metrics)}
                    onSave={() => onSave(date)}
                    onCancel={onCancel}
                    onDelete={() => onDelete(date)}
                  />
                </TableRow>
              );
            })}
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