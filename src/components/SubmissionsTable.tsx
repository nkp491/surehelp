import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, User, Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FormSubmission } from "@/types/form";
import { Badge } from "@/components/ui/badge";
import CustomerProfile from "./CustomerProfile";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
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

interface SubmissionsTableProps {
  submissions: FormSubmission[];
  onEdit: (submission: FormSubmission) => void;
}

const getSubmissionStatus = (submission: FormSubmission) => {
  if (submission.outcome === "Protected") return "bg-green-500";
  if (submission.outcome === "Follow-up") return "bg-yellow-500";
  if (submission.outcome === "Declined") return "bg-red-500";
  return "bg-gray-500";
};

const SubmissionsTable = ({ submissions, onEdit }: SubmissionsTableProps) => {
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

      // Force a page reload to refresh the submissions list
      window.location.reload();
    }
    setDeleteDialogOpen(false);
    setSubmissionToDelete(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submitted Forms</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>DOB</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((submission, index) => (
                <TableRow 
                  key={index}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => setSelectedCustomer(submission)}
                >
                  <TableCell>{submission.name}</TableCell>
                  <TableCell>{submission.dob}</TableCell>
                  <TableCell>{submission.age}</TableCell>
                  <TableCell>
                    <Badge 
                      className={`${getSubmissionStatus(submission)} text-white`}
                    >
                      {submission.outcome || 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(submission);
                        }}
                        className="flex items-center gap-2"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCustomer(submission);
                        }}
                        className="flex items-center gap-2"
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(submission);
                        }}
                        className="flex items-center gap-2 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {submissions.length === 0 && (
            <p className="text-center text-gray-500 py-8">No submissions yet</p>
          )}
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