
import { MetricCount } from "@/types/metrics";
import FilteredMetricsTable from './filters/FilteredMetricsTable';
import DeleteMetricDialog from './DeleteMetricDialog';
import { useRoleCheck } from "@/hooks/useRoleCheck";
import { UpgradePrompt } from "@/components/common/UpgradePrompt";

interface MetricsContentProps {
  sortedHistory: Array<{ date: string; metrics: MetricCount }>;
  editingRow: string | null;
  editedValues: MetricCount | null;
  selectedDate: Date | undefined;
  searchTerm: string;
  deleteDate: string | null;
  onEdit: (date: string, metrics: MetricCount) => void;
  onSave: (date: string) => void;
  onCancel: () => void;
  onSort: (key: string) => void;
  onValueChange: (metric: keyof MetricCount, value: string) => void;
  onDelete: (date: string) => void;
  onDeleteDialogChange: (open: boolean) => void;
  onConfirmDelete: () => void;
}

const MetricsContent = ({
  sortedHistory,
  editingRow,
  editedValues,
  selectedDate,
  searchTerm,
  deleteDate,
  onEdit,
  onSave,
  onCancel,
  onSort,
  onValueChange,
  onDelete,
  onDeleteDialogChange,
  onConfirmDelete,
}: MetricsContentProps) => {
  const { hasRequiredRole } = useRoleCheck();
  
  // Limit historical data for basic agents
  const hasFullHistoryAccess = hasRequiredRole([
    'agent_pro', 'manager_pro', 'manager_pro_gold', 'manager_pro_platinum', 'beta_user', 'system_admin'
  ]);
  
  // For basic agents, only show last 7 days of data
  const limitedHistory = hasFullHistoryAccess 
    ? sortedHistory 
    : sortedHistory.slice(0, 7);
  
  console.log('[MetricsContent] Rendering with:', {
    historyCount: sortedHistory.length,
    limitedHistoryCount: limitedHistory.length,
    hasFullAccess: hasFullHistoryAccess,
    dates: limitedHistory.map(h => h.date),
    searchTerm,
    selectedDate: selectedDate?.toISOString(),
    editingRow,
  });

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border">
        <FilteredMetricsTable
          history={limitedHistory}
          editingRow={editingRow}
          editedValues={editedValues}
          onEdit={onEdit}
          onSave={onSave}
          onCancel={onCancel}
          onSort={onSort}
          onValueChange={onValueChange}
          onDelete={onDelete}
          searchTerm={searchTerm}
          selectedDate={selectedDate}
        />
      </div>

      {!hasFullHistoryAccess && sortedHistory.length > 7 && (
        <div className="mt-4">
          <UpgradePrompt
            title="Extended Metrics History"
            description="Upgrade to Agent Pro to access your complete metrics history beyond 7 days and unlock historical trend analysis."
            requiredRole="agent_pro"
          />
        </div>
      )}

      <DeleteMetricDialog
        isOpen={!!deleteDate}
        onOpenChange={onDeleteDialogChange}
        onConfirm={onConfirmDelete}
      />
    </div>
  );
};

export default MetricsContent;
