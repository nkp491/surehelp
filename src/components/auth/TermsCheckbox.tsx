
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import TermsModal from "./TermsModal";

interface TermsCheckboxProps {
  isChecked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

const TermsCheckbox = ({ isChecked, onCheckedChange }: TermsCheckboxProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const openModal = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="flex items-start space-x-2 mt-4 mb-2">
        <Checkbox 
          id="terms" 
          checked={isChecked} 
          onCheckedChange={onCheckedChange}
          className="mt-1"
        />
        <div className="grid gap-1.5 leading-none">
          <Label 
            htmlFor="terms" 
            className="text-sm text-gray-600 font-normal cursor-pointer"
          >
            I agree to the{" "}
            <button 
              onClick={openModal}
              className="text-blue-600 hover:text-blue-800 hover:underline font-normal"
              type="button"
            >
              Terms and Conditions
            </button>
          </Label>
        </div>
      </div>
      
      <TermsModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
};

export default TermsCheckbox;
