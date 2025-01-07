import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, User, Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FormSubmission } from "@/types/form";
import { Badge } from "@/components/ui/badge";
import CustomerProfile from "./CustomerProfile";
import { useState } from "react";
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

interface SubmissionsTableProps {
  submissions: FormSubmission[];
  onEdit: (submission: FormSubmission) => void;
}

const getSubmissionStatus = (outcome: string | undefined) => {
  switch (outcome?.toLowerCase()) {
    case "protected":
      return "bg-green-500";
    case "follow-up":
      return "bg-yellow-500";
    case "declined":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};

const SubmissionsList = ({ submissions, onEdit, onDelete, onViewProfile }: {
  submissions: FormSubmission[];
  onEdit: (submission: FormSubmission) => void;
  onDelete: (submission: FormSubmission) => void;
  onViewProfile: (submission: FormSubmission) => void;
}) => {
  return (
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
          >
            <TableCell>{submission.name}</TableCell>
            <TableCell>{submission.dob}</TableCell>
            <TableCell>{submission.age}</TableCell>
            <TableCell>
              <Badge 
                className={`${getSubmissionStatus(submission.outcome)} text-white`}
              >
                {submission.outcome || 'Pending'}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(submission)}
                  className="flex items-center gap-2"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewProfile(submission)}
                  className="flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  Profile
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(submission)}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
        {submissions.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-8 text-gray-500">
              No submissions found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
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

      window.location.reload();
    }
    setDeleteDialogOpen(false);
    setSubmissionToDelete(null);
  };

  const protectedSubmissions = submissions.filter(s => s.outcome?.toLowerCase() === "protected");
  const followUpSubmissions = submissions.filter(s => s.outcome?.toLowerCase() === "follow-up");
  const declinedSubmissions = submissions.filter(s => s.outcome?.toLowerCase() === "declined");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submitted Forms</CardTitle>
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
              submissions={protectedSubmissions}
              onEdit={onEdit}
              onDelete={handleDelete}
              onViewProfile={setSelectedCustomer}
            />
          </TabsContent>

          <TabsContent value="follow-up">
            <SubmissionsList 
              submissions={followUpSubmissions}
              onEdit={onEdit}
              onDelete={handleDelete}
              onViewProfile={setSelectedCustomer}
            />
          </TabsContent>

          <TabsContent value="declined">
            <SubmissionsList 
              submissions={declinedSubmissions}
              onEdit={onEdit}
              onDelete={handleDelete}
              onViewProfile={setSelectedCustomer}
            />
          </TabsContent>
        </Tabs>

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