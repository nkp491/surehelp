import DraggableFormField from "../DraggableFormField";
import { useEffect, useState } from "react";
import IncomeDebugger from "../form-fields/IncomeDebugger";
import { FormField } from "@/types/formTypes";

interface FormData {
  employmentIncome?: string;
  socialSecurityIncome?: string;
  pensionIncome?: string;
  survivorshipIncome?: string;
  selectedInvestments_total?: string;
  totalIncome?: string;
  primaryTotalIncome?: string;
  onChange?: (fieldId: string, value: string) => void;
  [key: string]: any;
}

interface FormSectionProps {
  title: string;
  fields: FormField[];
  formData: FormData;
  setFormData: (data: FormData) => void;
}

const FormSection = ({
  title,
  fields,
  formData,
  setFormData,
}: FormSectionProps) => {
  // Keep a local copy of investment amounts to ensure they persist
  const [localInvestmentAmounts, setLocalInvestmentAmounts] = useState<
    Record<string, Record<string, string>>
  >({});

  // Keep track of investment totals
  const [investmentTotals, setInvestmentTotals] = useState<
    Record<string, number>
  >({});

  // Helper function to calculate total income
  const calculateTotalIncome = () => {
    // Clean and parse each income value to ensure proper number handling
    const cleanAndParse = (value: string): number => {
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
    if (investmentTotals?.selectedInvestments) {
      investmentIncome = investmentTotals.selectedInvestments;
    } else if (formData?.selectedInvestments_total) {
      investmentIncome = cleanAndParse(formData.selectedInvestments_total);
    }

    // Calculate total
    return (
      employment + socialSecurity + pension + survivorship + investmentIncome
    );
  };

  // Direct update function for the TotalIncomeField
  const handleDirectFieldChange = (fieldId: string, value: string) => {
    setFormData((prev: FormData) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  // Initialize local state from formData
  useEffect(() => {
    const initialAmounts: Record<string, Record<string, string>> = {};

    fields.forEach((field) => {
      if (field.type === "investmentTypes") {
        const fieldAmountsKey = `${field.id}_amounts`;
        if (formData[fieldAmountsKey]) {
          initialAmounts[field.id] = formData[fieldAmountsKey];
        }
      }
    });

    setLocalInvestmentAmounts(initialAmounts);
  }, []);

  // Update formData when local state changes
  useEffect(() => {
    const updatedFormData = { ...formData };

    Object.entries(localInvestmentAmounts).forEach(([fieldId, amounts]) => {
      updatedFormData[`${fieldId}_amounts`] = amounts;
    });

    setFormData(updatedFormData);
  }, [localInvestmentAmounts]);

  // Update formData when investment totals change
  useEffect(() => {
    const updatedFormData = { ...formData };

    Object.entries(investmentTotals).forEach(([fieldId, total]) => {
      // Store the total in a separate field for reference
      updatedFormData[`${fieldId}_total`] = total.toFixed(2);
    });

    // Calculate and set the total income directly
    const totalIncome = calculateTotalIncome();
    updatedFormData.totalIncome = totalIncome.toString();
    updatedFormData.primaryTotalIncome = totalIncome.toString(); // Also update primaryTotalIncome

    // Update the form data with all changes
    setFormData(updatedFormData);
  }, [investmentTotals]);

  // Add a separate effect to recalculate total when any income field changes
  useEffect(() => {
    // Calculate and set the total income directly
    const totalIncome = calculateTotalIncome();

    // Update the form data with the new total - ensure consistent field names
    setFormData((prev) => ({
      ...prev,
      totalIncome: totalIncome.toString(),
      primaryTotalIncome: totalIncome.toString(), // Consistent capitalization
    }));
  }, [
    formData?.employmentIncome,
    formData?.socialSecurityIncome,
    formData?.pensionIncome,
    formData?.survivorshipIncome,
    formData?.selectedInvestments_total,
    investmentTotals?.selectedInvestments, // Add investment totals to dependency array
  ]);

  const handleInvestmentAmountChange = (
    fieldId: string,
    type: string,
    amount: string
  ) => {
    setLocalInvestmentAmounts((prev) => {
      const fieldAmounts = { ...(prev[fieldId] || {}) };

      if (amount !== undefined) {
        fieldAmounts[type] = amount;
      }

      return {
        ...prev,
        [fieldId]: fieldAmounts,
      };
    });
  };

  const handleInvestmentTotalChange = (fieldId: string, total: number) => {
    setInvestmentTotals((prev) => ({
      ...prev,
      [fieldId]: total,
    }));

    // Calculate and set the total income immediately after investment total changes
    setTimeout(() => {
      const totalIncome = calculateTotalIncome();

      setFormData((prev) => ({
        ...prev,
        totalIncome: totalIncome.toString(),
        primaryTotalIncome: totalIncome.toString(), // Consistent capitalization
      }));
    }, 0);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden h-fit">
      <div className="bg-[#6CAEC2] text-white px-3 py-1.5 text-sm font-medium">
        {title}
      </div>
      <div className="p-2">
        {/* Add the IncomeDebugger component for debugging */}
        {title.toLowerCase().includes("income") && (
          <IncomeDebugger formData={formData} />
        )}
        <div className="space-y-2">
          {fields.map((field) => {
            // Get the current field value
            const fieldValue = formData[field.id] || [];

            // Get investment amounts from local state for better persistence
            const fieldAmounts =
              field.type === "investmentTypes"
                ? localInvestmentAmounts[field.id] || {}
                : {};

            // Create a copy of formData with investment totals for TotalIncomeField
            const enhancedFormData = {
              ...formData,
              selectedInvestments_total: investmentTotals.selectedInvestments
                ? investmentTotals.selectedInvestments.toString()
                : undefined,
              onChange: handleDirectFieldChange, // Add the onChange function
            };

            return (
              <div key={field.id} className="min-h-[40px]">
                <DraggableFormField
                  id={field.id}
                  fieldType={field.type}
                  label={field.label}
                  value={fieldValue}
                  onChange={(value) => {
                    // Update the form data with the new value
                    setFormData((prev: FormData) => {
                      const updated = { ...prev, [field.id]: value };

                      // If this is an income field, immediately recalculate the total income
                      if (
                        [
                          "employmentIncome",
                          "socialSecurityIncome",
                          "pensionIncome",
                          "survivorshipIncome",
                        ].includes(field.id)
                      ) {
                        // We'll let the effect handle this
                      }

                      return updated;
                    });
                  }}
                  investmentAmounts={fieldAmounts}
                  onInvestmentAmountChange={(type, amount) => {
                    if (field.type === "investmentTypes") {
                      handleInvestmentAmountChange(field.id, type, amount);
                    }
                  }}
                  onInvestmentTotalChange={(total) => {
                    if (field.type === "investmentTypes") {
                      handleInvestmentTotalChange(field.id, total);
                    }
                  }}
                  formData={enhancedFormData} // Pass the enhanced formData
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FormSection;
