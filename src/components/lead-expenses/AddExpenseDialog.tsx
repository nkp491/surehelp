import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import LeadExpenseForm from "@/components/lead-expenses/LeadExpenseForm";

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
          className="bg-[#D9D9D9] hover:bg-[#2A6F97] hover:text-[#FFFCF6] transition-colors border-2 border-[#2A6F97] px-6 py-2 rounded-lg mb-4"
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