
import { Table, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { FormSubmission } from "@/types/form";
import { jsPDF } from "jspdf";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import TableActions from "./TableActions";
import StatusBadge from "./StatusBadge";
import SubmissionsTableHeader from "./TableHeader";

interface SubmissionsListProps {
  submissions: FormSubmission[];
  onEdit: (submission: FormSubmission) => void;
  onDelete: (submission: FormSubmission) => void;
  onViewProfile: (submission: FormSubmission) => void;
  onSort: (field: keyof FormSubmission) => void;
  onBackdate?: (submission: FormSubmission) => void;
}

const SubmissionsList = ({ 
  submissions, 
  onEdit, 
  onDelete, 
  onViewProfile, 
  onSort,
  onBackdate
}: SubmissionsListProps) => {
  const { toast } = useToast();

  const formatDate = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const handleExportPDF = (submission: FormSubmission) => {
    try {
      const doc = new jsPDF();
      let yPos = 20;
      const lineHeight = 10;

      // Add title
      doc.setFontSize(16);
      doc.text("Assessment Report", 20, yPos);
      yPos += lineHeight * 2;

      // Add submission details
      doc.setFontSize(12);
      Object.entries(submission).forEach(([key, value]) => {
        if (value && typeof value !== 'object') {
          doc.text(`${key}: ${value}`, 20, yPos);
          yPos += lineHeight;
        }
      });

      // Save the PDF
      doc.save(`assessment-${submission.timestamp}.pdf`);
      
      toast({
        title: "Success",
        description: "PDF exported successfully",
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({
        title: "Error",
        description: "Failed to export PDF",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="rounded-lg overflow-hidden">
      <Table>
        <SubmissionsTableHeader onSort={onSort} />
        <TableBody>
          {submissions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                No submissions found
              </TableCell>
            </TableRow>
          ) : (
            submissions.map((submission) => (
              <TableRow key={submission.timestamp} className="hover:bg-gray-50">
                <TableCell className="font-medium">
                  {formatDate(submission.timestamp)}
                </TableCell>
                <TableCell>{submission.name || 'N/A'}</TableCell>
                <TableCell>{submission.dob || 'N/A'}</TableCell>
                <TableCell>
                  <StatusBadge outcome={submission.outcome || 'N/A'} />
                </TableCell>
                <TableCell>
                  <TableActions
                    submission={submission}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onViewProfile={onViewProfile}
                    onExportPDF={handleExportPDF}
                    onBackdate={onBackdate}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default SubmissionsList;
