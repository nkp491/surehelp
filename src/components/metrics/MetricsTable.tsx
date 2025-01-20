import { Table, TableBody, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';
import { MetricCount } from "@/types/metrics";
import MetricsTableHeader from "./MetricsTableHeader";
import EditableMetricCell from "./EditableMetricCell";
import MetricRowActions from "./MetricRowActions";

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
  const formatValue = (value: number, metric: keyof MetricCount) => {
    if (metric === 'ap') {
      return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return value.toString();
  };

  const isEmptyRecord = (metrics: MetricCount) => {
    return Object.values(metrics).every(value => value === 0);
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <MetricsTableHeader onSort={onSort} />
        <TableBody>
          {history.map(({ date, metrics }) => {
            const currentValues = editingRow === date ? editedValues : metrics;
            const isEmpty = isEmptyRecord(metrics);
            
            return (
              <TableRow 
                key={date}
                className={isEmpty ? "bg-gray-50" : ""}
              >
                <EditableMetricCell
                  isEditing={false}
                  value={format(new Date(date), 'MMM dd, yyyy')}
                  onChange={() => {}}
                  metric="date"
                  className={isEmpty ? "text-gray-500 italic" : ""}
                />
                {Object.entries(metrics).map(([metric, _]) => (
                  <EditableMetricCell
                    key={metric}
                    isEditing={editingRow === date}
                    value={currentValues ? formatValue(currentValues[metric as keyof MetricCount], metric as keyof MetricCount) : '0'}
                    onChange={(newValue) => onValueChange(metric as keyof MetricCount, newValue)}
                    metric={metric}
                    className={isEmpty ? "text-gray-500 italic" : ""}
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
  );
};

export default MetricsTable;