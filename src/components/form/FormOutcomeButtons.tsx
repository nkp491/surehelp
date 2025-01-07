import { Button } from "../ui/button";

interface FormOutcomeButtonsProps {
  onOutcomeSubmit: (outcome: string) => (e: React.MouseEvent) => void;
}

const FormOutcomeButtons = ({ onOutcomeSubmit }: FormOutcomeButtonsProps) => {
  return (
    <div className="mt-8 grid grid-cols-3 gap-4 max-w-xl mx-auto">
      <Button 
        onClick={onOutcomeSubmit('protected')}
        className="bg-green-600 hover:bg-green-700"
      >
        Protected
      </Button>
      <Button 
        onClick={onOutcomeSubmit('follow-up')}
        className="bg-yellow-600 hover:bg-yellow-700"
      >
        Follow-Up
      </Button>
      <Button 
        onClick={onOutcomeSubmit('declined')}
        className="bg-red-600 hover:bg-red-700"
      >
        Declined
      </Button>
    </div>
  );
};

export default FormOutcomeButtons;