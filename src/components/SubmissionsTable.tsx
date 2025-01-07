import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FormSubmission } from "@/types/form";

interface SubmissionsTableProps {
  submissions: FormSubmission[];
  onEdit: (submission: FormSubmission) => void;
}

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
                <TableHead>Height</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Tobacco Use</TableHead>
                <TableHead>Medical Conditions</TableHead>
                <TableHead>Policy Number</TableHead>
                <TableHead>Premium</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((submission, index) => (
                <TableRow key={index}>
                  <TableCell>{submission.name}</TableCell>
                  <TableCell>{submission.dob}</TableCell>
                  <TableCell>{submission.age}</TableCell>
                  <TableCell>{submission.height}</TableCell>
                  <TableCell>{submission.weight}</TableCell>
                  <TableCell>{submission.tobaccoUse}</TableCell>
                  <TableCell>
                    {Array.isArray(submission.selectedConditions) 
                      ? submission.selectedConditions.join(", ")
                      : submission.selectedConditions}
                  </TableCell>
                  <TableCell>{submission.policyNumber}</TableCell>
                  <TableCell>{submission.premium}</TableCell>
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