import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface EmploymentStatusCheckboxProps {
  selectedStatus: string[];
  onChange: (status: string[]) => void;
}

const EMPLOYMENT_STATUS = [
  "Retired",
  "Employed",
  "Unemployed",
  "Disabled"
];

const EmploymentStatusCheckbox = ({
  selectedStatus = [], // Add default empty array
  onChange,
}: EmploymentStatusCheckboxProps) => {
  const handleCheckboxChange = (status: string, checked: boolean) => {
    if (checked) {
      onChange([...(selectedStatus || []), status]);
    } else {
      onChange((selectedStatus || []).filter((s) => s !== status));
    }
  };

  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold">Employment Status</Label>
      <div className="grid grid-cols-2 gap-4">
        {EMPLOYMENT_STATUS.map((status) => (
          <div key={status} className="flex items-center space-x-2">
            <Checkbox
              id={status}
              checked={(selectedStatus || []).includes(status)}
              onCheckedChange={(checked) =>
                handleCheckboxChange(status, checked as boolean)
              }
            />
            <Label
              htmlFor={status}
              className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {status}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmploymentStatusCheckbox;