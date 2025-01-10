import { Table, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { FormSubmission } from "@/types/form";
import { jsPDF } from "jspdf";
import { useToast } from "@/components/ui/use-toast";
import TableActions from "./TableActions";
import StatusBadge from "./StatusBadge";
import SubmissionsTableHeader from "./TableHeader";

interface SubmissionsListProps {
  submissions: FormSubmission[];
  onEdit: (submission: FormSubmission) => void;
  onDelete: (submission: FormSubmission) => void;
  onViewProfile: (submission: FormSubmission) => void;
  onSort: (field: keyof FormSubmission) => void;
}

const SubmissionsList = ({ 
  submissions, 
  onEdit, 
  onDelete, 
  onViewProfile, 
  onSort 
}: SubmissionsListProps) => {
  const { toast } = useToast();

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
      const addField = (label: string, value: string | undefined) => {
        if (value) {
          doc.text(`${label}: ${value}`, 20, yPos);
          yPos += lineHeight;
        }
      };

      // Personal Information
      doc.setFont(undefined, 'bold');
      doc.text("Personal Information", 20, yPos);
      yPos += lineHeight;
      doc.setFont(undefined, 'normal');

      addField("Name", submission.name);
      addField("Date of Birth", submission.dob);
      addField("Age", submission.age);
      addField("Height", submission.height);
      addField("Weight", submission.weight);

      // Medical Information
      yPos += lineHeight;
      doc.setFont(undefined, 'bold');
      doc.text("Medical Information", 20, yPos);
      yPos += lineHeight;
      doc.setFont(undefined, 'normal');

      addField("Tobacco Use", submission.tobaccoUse);
      addField("Medical Conditions", submission.medicalConditions);
      addField("Hospitalizations", submission.hospitalizations);
      addField("Surgeries", submission.surgeries);
      addField("Medications", submission.prescriptionMedications);

      // Save the PDF
      doc.save(`assessment-${submission.name}-${new Date().toISOString().split('T')[0]}.pdf`);

      toast({
        title: "Success",
        description: "PDF exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export PDF",
        variant: "destructive",
      });
    }
  };

  return (
    <Table>
      <SubmissionsTableHeader onSort={onSort} />
      <TableBody>
        {submissions.map((submission, index) => (
          <TableRow key={index} className="cursor-pointer hover:bg-gray-50">
            <TableCell>{submission.name}</TableCell>
            <TableCell>{submission.dob}</TableCell>
            <TableCell>{submission.age}</TableCell>
            <TableCell>
              <StatusBadge outcome={submission.outcome} />
            </TableCell>
            <TableCell>
              <TableActions
                submission={submission}
                onEdit={onEdit}
                onDelete={onDelete}
                onViewProfile={onViewProfile}
                onExportPDF={handleExportPDF}
              />
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