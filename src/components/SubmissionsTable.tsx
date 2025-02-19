import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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

  return (
    <Card className="bg-[#faf7f0] w-full">
      <CardHeader className="space-y-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-[#2A6F97]">Submitted Forms</CardTitle>
          <Button
            onClick={handleExport}
            className="flex items-center gap-2"
            variant="outline"
            disabled={!submissions.length}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
          </div>
          <FilterBar filters={filters} onFilterChange={setFilters} />
        </div>
      </CardHeader>
      <CardContent className="p-6">
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
      </CardContent>
    </Card>
  );
};

export default SubmissionsTable;