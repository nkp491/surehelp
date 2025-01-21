import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AddExpenseDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const AddExpenseDialog = ({ isOpen, onOpenChange, onSuccess }: AddExpenseDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="bg-[#FFFCF6] hover:bg-[#2A6F97] hover:text-[#FFFCF6] transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Lead Expense</DialogTitle>
          <DialogDescription>
            Enter the details for a new lead expense record
          </DialogDescription>
        </DialogHeader>
        <LeadExpenseForm
          onSuccess={() => {
            onSuccess();
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddExpenseDialog;