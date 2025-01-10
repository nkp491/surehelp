import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FormSubmission } from "@/types/form";
import CustomerProfile from "./CustomerProfile";
import SearchBar from "./submissions/SearchBar";
import FilterBar from "./submissions/FilterBar";
import SubmissionsList from "./submissions/SubmissionsList";
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

const ITEMS_PER_PAGE = 10;

const SubmissionsTable = ({ submissions, onEdit }: SubmissionsTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ status: [], dateRange: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<FormSubmission | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [submissionToDelete, setSubmissionToDelete] = useState<FormSubmission | null>(null);
  const { toast } = useToast();

  const handleDelete = (submission: FormSubmission) => {
    setSubmissionToDelete(submission);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (submissionToDelete) {
      const updatedSubmissions = JSON.parse(localStorage.getItem("formSubmissions") || "[]")
        .filter((s: FormSubmission) => s.timestamp !== submissionToDelete.timestamp);
      localStorage.setItem("formSubmissions", JSON.stringify(updatedSubmissions));
      
      toast({
        title: "Success",
        description: "Form submission deleted successfully",
      });

      window.location.reload();
    }
    setDeleteDialogOpen(false);
    setSubmissionToDelete(null);
  };

  const filterSubmissions = (submissions: FormSubmission[]) => {
    return submissions.filter((submission) => {
      const matchesSearch = submission.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filters.status.length === 0 || filters.status.includes(submission.outcome?.toLowerCase() || "");
      return matchesSearch && matchesStatus;
    });
  };

  const paginateSubmissions = (submissions: FormSubmission[]) => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return submissions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  const protectedSubmissions = filterSubmissions(submissions.filter(s => s.outcome?.toLowerCase() === "protected"));
  const followUpSubmissions = filterSubmissions(submissions.filter(s => s.outcome?.toLowerCase() === "follow-up"));
  const declinedSubmissions = filterSubmissions(submissions.filter(s => s.outcome?.toLowerCase() === "declined"));

  const totalPages = Math.ceil(submissions.length / ITEMS_PER_PAGE);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submitted Forms</CardTitle>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="flex-1">
            <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
          </div>
          <FilterBar filters={filters} onFilterChange={setFilters} />
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="protected" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="protected" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
              Protected ({protectedSubmissions.length})
            </TabsTrigger>
            <TabsTrigger value="follow-up" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white">
              Follow-up ({followUpSubmissions.length})
            </TabsTrigger>
            <TabsTrigger value="declined" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
              Declined ({declinedSubmissions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="protected">
            <SubmissionsList 
              submissions={paginateSubmissions(protectedSubmissions)}
              onEdit={onEdit}
              onDelete={handleDelete}
              onViewProfile={setSelectedCustomer}
            />
          </TabsContent>

          <TabsContent value="follow-up">
            <SubmissionsList 
              submissions={paginateSubmissions(followUpSubmissions)}
              onEdit={onEdit}
              onDelete={handleDelete}
              onViewProfile={setSelectedCustomer}
            />
          </TabsContent>

          <TabsContent value="declined">
            <SubmissionsList 
              submissions={paginateSubmissions(declinedSubmissions)}
              onEdit={onEdit}
              onDelete={handleDelete}
              onViewProfile={setSelectedCustomer}
            />
          </TabsContent>
        </Tabs>

        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
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
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>

        {selectedCustomer && (
          <CustomerProfile
            customer={selectedCustomer}
            isOpen={!!selectedCustomer}
            onClose={() => setSelectedCustomer(null)}
          />
        )}

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the form submission.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};

export default SubmissionsTable;