import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FormSubmission } from "@/types/form";
import { Badge } from "@/components/ui/badge";

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
                <TableRow key={index}>
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(submission)}
                      className="flex items-center gap-2"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {submissions.length === 0 && (
            <p className="text-center text-gray-500 py-8">No submissions yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubmissionsTable;