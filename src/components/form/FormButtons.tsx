import { Button } from "@/components/ui/button";
import { Check, Clock, X } from "lucide-react";

interface FormButtonsProps {
  onSubmit: (e: React.MouseEvent<HTMLButtonElement>, outcome: string) => void;
}

const FormButtons = ({ onSubmit }: FormButtonsProps) => {
  return (
    <div className="mt-8">
      <div className="text-center mb-4 text-lg font-medium text-gray-700">
        Submit as
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-xl mx-auto">
        <Button 
          onClick={(e) => onSubmit(e, 'protected')}
          className="bg-green-600 hover:bg-green-700 h-auto py-4 flex flex-col items-center gap-2"
        >
          <Check className="h-6 w-6" />
          <span className="font-medium">Protected</span>
        </Button>
        <Button 
          onClick={(e) => onSubmit(e, 'follow-up')}
          className="bg-yellow-600 hover:bg-yellow-700 h-auto py-4 flex flex-col items-center gap-2"
        >
          <Clock className="h-6 w-6" />
          <span className="font-medium">Follow-up</span>
        </Button>
        <Button 
          onClick={(e) => onSubmit(e, 'declined')}
          className="bg-red-600 hover:bg-red-700 h-auto py-4 flex flex-col items-center gap-2"
        >
          <X className="h-6 w-6" />
          <span className="font-medium">Declined</span>
        </Button>
      </div>
    </div>
  );
};

export default FormButtons;