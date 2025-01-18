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
}: MetricsTableProps) => {
  const formatValue = (value: number, metric: keyof MetricCount) => {
    if (metric === 'ap') {
      return (value / 100).toFixed(2);
    }
    return value.toString();
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <MetricsTableHeader onSort={onSort} />
        <TableBody>
          {history.map(({ date, metrics }) => (
            <TableRow key={date}>
              <EditableMetricCell
                isEditing={false}
                value={format(new Date(date), 'MMM dd, yyyy')}
                onChange={() => {}}
                metric="date"
              />
              {Object.entries(metrics).map(([metric, value]) => (
                <EditableMetricCell
                  key={metric}
                  isEditing={editingRow === date}
                  value={formatValue(value, metric as keyof MetricCount)}
                  onChange={(newValue) => onValueChange(metric as keyof MetricCount, newValue)}
                  metric={metric}
                />
              ))}
              <MetricRowActions
                isEditing={editingRow === date}
                onEdit={() => onEdit(date, metrics)}
                onSave={() => onSave(date)}
                onCancel={onCancel}
              />
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default MetricsTable;