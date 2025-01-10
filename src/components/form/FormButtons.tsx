import { Button } from "@/components/ui/button";
import { Check, Clock, X } from "lucide-react";

interface FormButtonsProps {
  onSubmit: (outcome: string) => (e: React.MouseEvent) => void;
}

const FormButtons = ({ onSubmit }: FormButtonsProps) => {
  return (
    <div className="mt-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-xl mx-auto">
        <Button 
          onClick={onSubmit('protected')}
          className="bg-green-600 hover:bg-green-700 h-auto py-4 flex flex-col items-center gap-2"
        >
          <Check className="h-6 w-6" />
          <span className="font-medium">Submit as Protected</span>
        </Button>
        <Button 
          onClick={onSubmit('follow-up')}
          className="bg-yellow-600 hover:bg-yellow-700 h-auto py-4 flex flex-col items-center gap-2"
        >
          <Clock className="h-6 w-6" />
          <span className="font-medium">Submit for Follow-up</span>
        </Button>
        <Button 
          onClick={onSubmit('declined')}
          className="bg-red-600 hover:bg-red-700 h-auto py-4 flex flex-col items-center gap-2"
        >
          <X className="h-6 w-6" />
          <span className="font-medium">Submit as Declined</span>
        </Button>
      </div>
    </div>
  );
};

export default FormButtons;