import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TotalIncomeFieldProps {
  label: string;
  formData?: {
    employmentIncome?: string;
    socialSecurityIncome?: string;
    pensionIncome?: string;
    survivorshipIncome?: string;
    selectedInvestments_total?: string;
    onChange?: (field: string, value: string) => void;
  };
  placeholder?: string;
  required?: boolean;
  error?: string;
  readOnly?: boolean;
}

const TotalIncomeField = ({
  label,
  formData,
  placeholder,
  required = false,
  error,
  readOnly = true, // Always read-only since it's calculated
}: TotalIncomeFieldProps) => {
  // State to store the calculated total
  const [totalIncome, setTotalIncome] = useState("0");

  // Calculate total income whenever relevant form data changes
  useEffect(() => {
    // Early return if formData is undefined or null
    if (!formData) {
      setTotalIncome("0");
      return;
    }

    // Helper function to clean and parse values
    const cleanAndParse = (value: string | undefined): number => {
      if (!value) return 0;
      // Remove any non-numeric characters except decimal point
      const cleanValue = value.replace(/[^\d.]/g, "");
      return parseFloat(cleanValue) || 0;
    };

    // Get all income values with safe property access
    const employment = cleanAndParse(formData?.employmentIncome);
    const socialSecurity = cleanAndParse(formData?.socialSecurityIncome);
    const pension = cleanAndParse(formData?.pensionIncome);
    const survivorship = cleanAndParse(formData?.survivorshipIncome);

    // Get investment income if available
    let investmentIncome = 0;
    if (formData?.selectedInvestments_total) {
      investmentIncome = cleanAndParse(formData.selectedInvestments_total);
    }

    // Calculate total
    const total =
      employment + socialSecurity + pension + survivorship + investmentIncome;

    // Format the total
    setTotalIncome(total.toFixed(2));

    // IMPORTANT: Also update the formData directly if possible
    if (formData?.onChange) {
      // Use consistent field name
      formData.onChange("primaryTotalIncome", total.toString());
    }
  }, [
    formData?.employmentIncome,
    formData?.socialSecurityIncome,
    formData?.pensionIncome,
    formData?.survivorshipIncome,
    formData?.selectedInvestments_total,
  ]);

  // Defensive check for required props (after hooks)
  if (!label) {
    console.warn("[TotalIncomeField] Label is required but not provided");
    return null;
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div className="relative">
        <span className="absolute left-3 top-2.5">$</span>
        <Input
          type="text"
          value={totalIncome}
          placeholder={placeholder}
          className={cn("pl-7", error ? "border-destructive" : "border-input")}
          readOnly={true}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

export default TotalIncomeField;
