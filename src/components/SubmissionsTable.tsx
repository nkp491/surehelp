
import { useState } from "react";
import { FormSubmission } from "@/types/form";
import CustomerProfile from "./CustomerProfile";
import { useSubmissionsTable } from "@/hooks/useSubmissionsTable";
import { useRoleCheck } from "@/hooks/useRoleCheck";
import { UpgradePrompt } from "@/components/common/UpgradePrompt";
import SubmissionsToolbar from "./submissions/SubmissionsToolbar";
import { SubmissionTabs } from "./submissions/SubmissionTabs";
import { DeleteDialog } from "./submissions/DeleteDialog";
import SubmissionsPagination from "./submissions/SubmissionsPagination";
import { useSubmissionDelete } from "./submissions/useSubmissionDelete";
import { useSubmissionExport } from "./submissions/useSubmissionExport";
import { AgentTypes } from "@/types/agent";

interface SubmissionsTableProps {
  submissions: FormSubmission[];
  onEdit: (submission: FormSubmission) => void;
}

const SubmissionsTable = ({ submissions, onEdit }: SubmissionsTableProps) => {
  const [selectedCustomer, setSelectedCustomer] = useState<FormSubmission | null>(null);
  const { hasRequiredRole } = useRoleCheck();

  const {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    currentPage,
    setCurrentPage,
    handleSort,
    processSubmissions,
    totalPages
  } = useSubmissionsTable(submissions);

  const { 
    deleteDialogOpen, 
    setDeleteDialogOpen, 
    submissionToDelete, 
    handleDelete, 
    confirmDelete 
  } = useSubmissionDelete();

  const { handleExport } = useSubmissionExport(submissions);

  const processedSubmissions = {
    protected: processSubmissions(submissions.filter(s => s.outcome?.toLowerCase() === "protected") || []),
    followUp: processSubmissions(submissions.filter(s => s.outcome?.toLowerCase() === "follow-up") || []),
    declined: processSubmissions(submissions.filter(s => s.outcome?.toLowerCase() === "declined") || [])
  };

  // adding the dynamic roles from the AgentTypes
  const roles = Object.values(AgentTypes);
  // If user doesn't have the required role for advanced features
  const showAdvancedFiltering = hasRequiredRole(roles);

  return (
    <div className="space-y-8">
      <SubmissionsToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filters={filters}
        onFilterChange={setFilters}
        submissions={submissions}
        onExport={handleExport}
        showAdvancedFiltering={showAdvancedFiltering}
      />

      <div className="bg-white p-6 rounded-lg shadow-sm text-[#2A6F97]">
        <SubmissionTabs
          submissions={processedSubmissions}
          onEdit={onEdit}
          onDelete={handleDelete}
          onViewProfile={setSelectedCustomer}
          onSort={handleSort}
        />

        <SubmissionsPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {selectedCustomer && (
        <CustomerProfile
          customer={selectedCustomer}
          isOpen={true}
          onClose={() => setSelectedCustomer(null)}
        />
      )}

      <DeleteDialog
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
      />

      {/* Show upgrade prompt when not having advanced features */}
      {!showAdvancedFiltering && (
        <div className="mt-6">
          <UpgradePrompt
            title="Enhanced Client Management"
            description="Upgrade to Agent Pro to unlock advanced filtering, CSV exports, and more powerful client management tools."
            requiredRole="agent_pro"
          />
        </div>
      )}
    </div>
  );
};

export default SubmissionsTable;
