
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { FormSubmission } from "@/types/form";
import CustomerProfile from "./CustomerProfile";
import SearchBar from "./submissions/SearchBar";
import FilterBar from "./submissions/FilterBar";
import { SubmissionTabs } from "./submissions/SubmissionTabs";
import { DeleteDialog } from "./submissions/DeleteDialog";
import { useSubmissionsTable } from "@/hooks/useSubmissionsTable";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useRoleCheck } from "@/hooks/useRoleCheck";
import { UpgradePrompt } from "@/components/common/UpgradePrompt";
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface SubmissionsTableProps {
  submissions: FormSubmission[];
  onEdit: (submission: FormSubmission) => void;
}

const SubmissionsTable = ({ submissions, onEdit }: SubmissionsTableProps) => {
  const [selectedCustomer, setSelectedCustomer] = useState<FormSubmission | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [submissionToDelete, setSubmissionToDelete] = useState<FormSubmission | null>(null);
  const { toast } = useToast();
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

  const handleDelete = (submission: FormSubmission) => {
    // Only allow deletion for agent_pro and above
    if (!hasRequiredRole(['agent_pro', 'manager_pro', 'manager_pro_gold', 'manager_pro_platinum', 'beta_user', 'system_admin'])) {
      toast({
        title: "Upgrade Required",
        description: "Deleting submissions requires Agent Pro or higher.",
        variant: "destructive",
      });
      return;
    }
    
    setSubmissionToDelete(submission);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (submissionToDelete) {
      try {
        const { error } = await supabase
          .from('submissions')
          .delete()
          .eq('timestamp', submissionToDelete.timestamp);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Form submission deleted successfully",
        });

        window.location.reload();
      } catch (error) {
        console.error("Error deleting submission:", error);
        toast({
          title: "Error",
          description: "Failed to delete submission",
          variant: "destructive",
        });
      }
    }
    setDeleteDialogOpen(false);
    setSubmissionToDelete(null);
  };

  const handleExport = () => {
    // Restrict export functionality to agent_pro and above
    if (!hasRequiredRole(['agent_pro', 'manager_pro', 'manager_pro_gold', 'manager_pro_platinum', 'beta_user', 'system_admin'])) {
      toast({
        title: "Upgrade Required",
        description: "Exporting submissions requires Agent Pro or higher.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      if (!submissions.length) {
        toast({
          title: "Error",
          description: "No submissions to export",
          variant: "destructive",
        });
        return;
      }

      // Convert submissions to CSV format
      const headers = Object.keys(submissions[0]).join(',');
      const rows = submissions.map(submission => 
        Object.values(submission).map(value => 
          typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
        ).join(',')
      );
      const csv = [headers, ...rows].join('\n');

      // Create and trigger download
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', `submissions-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Submissions exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export submissions",
        variant: "destructive",
      });
    }
  };

  const processedSubmissions = {
    protected: processSubmissions(submissions.filter(s => s.outcome?.toLowerCase() === "protected") || []),
    followUp: processSubmissions(submissions.filter(s => s.outcome?.toLowerCase() === "follow-up") || []),
    declined: processSubmissions(submissions.filter(s => s.outcome?.toLowerCase() === "declined") || [])
  };

  // If user doesn't have the required role for advanced features
  const showAdvancedFiltering = hasRequiredRole(['agent_pro', 'manager_pro', 'manager_pro_gold', 'manager_pro_platinum', 'beta_user', 'system_admin']);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm text-[#2A6F97]">
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <div className="flex-1">
            <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
          </div>
          <div className="flex items-center gap-4">
            {showAdvancedFiltering ? (
              <>
                <FilterBar filters={filters} onFilterChange={setFilters} />
                <Button
                  onClick={handleExport}
                  className="flex items-center gap-2"
                  variant="outline"
                  disabled={!submissions.length}
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
              </>
            ) : (
              <Button
                onClick={() => {}}
                className="flex items-center gap-2 opacity-60 cursor-not-allowed"
                variant="outline"
                disabled
              >
                <Download className="h-4 w-4" />
                Pro Feature
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm text-[#2A6F97]">
        <SubmissionTabs
          submissions={processedSubmissions}
          onEdit={onEdit}
          onDelete={handleDelete}
          onViewProfile={setSelectedCustomer}
          onSort={handleSort}
        />

        {totalPages > 1 && (
          <div className="mt-4 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
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
