import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, User, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FormSubmission } from "@/types/form";

interface SubmissionsListProps {
  submissions: FormSubmission[];
  onEdit: (submission: FormSubmission) => void;
  onDelete: (submission: FormSubmission) => void;
  onViewProfile: (submission: FormSubmission) => void;
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

const SubmissionsList = ({ submissions, onEdit, onDelete, onViewProfile }: SubmissionsListProps) => {
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
          <TableRow key={index} className="cursor-pointer hover:bg-gray-50">
            <TableCell>{submission.name}</TableCell>
            <TableCell>{submission.dob}</TableCell>
            <TableCell>{submission.age}</TableCell>
            <TableCell>
              <Badge className={`${getSubmissionStatus(submission.outcome)} text-white`}>
                {submission.outcome || "Pending"}
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

export default SubmissionsList;