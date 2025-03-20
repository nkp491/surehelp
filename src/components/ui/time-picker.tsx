
import * as React from "react";
import { Clock } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface TimePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export function TimePicker({
  label,
  value,
  onChange,
  className,
  ...props
}: TimePickerProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className="flex flex-col space-y-1.5">
      {label && <Label htmlFor={props.id}>{label}</Label>}
      <div className="relative">
        <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="time"
          value={value}
          onChange={handleChange}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        />
      </div>
    </div>
  );
}
