import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";

interface TermsCheckboxProps {
  isChecked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

const TermsCheckbox = ({ isChecked, onCheckedChange }: TermsCheckboxProps) => {
  return (
    <div className="flex items-center space-x-2 mt-4 mb-2">
      <Checkbox id="terms" checked={isChecked} onCheckedChange={onCheckedChange} />
      <div className="grid gap-1.5 accent--[#2A6F97]">
        <Label htmlFor="terms" className="text-sm text-gray-600 font-normal cursor-pointer">
          I agree to the{" "}
          <Link
            to="/auth/terms"
            className="hover:text-[#2A6F97] hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Terms and Conditions
          </Link>
        </Label>
      </div>
    </div>
  );
};

export default TermsCheckbox;
