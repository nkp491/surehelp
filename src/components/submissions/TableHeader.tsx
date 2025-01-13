import { TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { FormSubmission } from "@/types/form";

interface TableHeaderProps {
  onSort: (field: keyof FormSubmission) => void;
}

const SubmissionsTableHeader = ({ onSort }: TableHeaderProps) => {
  return (
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
            onClick={() => onSort('timestamp')}
            className="flex items-center gap-1 hover:bg-gray-100"
          >
            Date Submitted
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
  );
};

export default SubmissionsTableHeader;