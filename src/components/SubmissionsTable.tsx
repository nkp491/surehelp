import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, User } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FormSubmission } from "@/types/form";
import { Badge } from "@/components/ui/badge";
import CustomerProfile from "./CustomerProfile";
import { useState } from "react";

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
      </CardContent>
    </Card>
  );
};

export default SubmissionsTable;