import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, User, Trash2, ArrowUpDown, FileDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FormSubmission } from "@/types/form";
import { jsPDF } from "jspdf";
import { useToast } from "@/components/ui/use-toast";

interface SubmissionsListProps {
  submissions: FormSubmission[];
  onEdit: (submission: FormSubmission) => void;
  onDelete: (submission: FormSubmission) => void;
  onViewProfile: (submission: FormSubmission) => void;
  onSort: (field: keyof FormSubmission) => void;
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

const SubmissionsList = ({ submissions, onEdit, onDelete, onViewProfile, onSort }: SubmissionsListProps) => {
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

      // Financial Information
      yPos += lineHeight;
      doc.setFont(undefined, 'bold');
      doc.text("Financial Information", 20, yPos);
      yPos += lineHeight;
      doc.setFont(undefined, 'normal');

      addField("Employment Status", submission.employmentStatus?.join(", "));
      addField("Occupation", submission.occupation);
      addField("Total Income", submission.totalIncome);
      addField("Life Insurance Amount", submission.lifeInsuranceAmount);

      // Contact Information
      yPos += lineHeight;
      doc.setFont(undefined, 'bold');
      doc.text("Contact Information", 20, yPos);
      yPos += lineHeight;
      doc.setFont(undefined, 'normal');

      addField("Phone", submission.phone);
      addField("Email", submission.email);
      addField("Address", submission.address);

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
      <TableHeader>
        <TableRow>
          <TableHead>
            <Button 
              variant="ghost" 
              onClick={() => onSort('name')}
              className="flex items-center gap-1 hover:bg-gray-100"
            >
              Name
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>
            <Button 
              variant="ghost" 
              onClick={() => onSort('dob')}
              className="flex items-center gap-1 hover:bg-gray-100"
            >
              DOB
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>
            <Button 
              variant="ghost" 
              onClick={() => onSort('age')}
              className="flex items-center gap-1 hover:bg-gray-100"
            >
              Age
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>
            <Button 
              variant="ghost" 
              onClick={() => onSort('outcome')}
              className="flex items-center gap-1 hover:bg-gray-100"
            >
              Status
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </TableHead>
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
                  onClick={() => handleExportPDF(submission)}
                  className="flex items-center gap-2"
                >
                  <FileDown className="h-4 w-4" />
                  PDF
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