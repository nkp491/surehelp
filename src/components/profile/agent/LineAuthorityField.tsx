
import React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronDown, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type LineAuthorityFieldProps = {
  value: string[];
  onChange: (authorities: string[]) => void;
  isEditing: boolean;
  label: string;
  placeholder: string;
};

const LineAuthorityField = ({ value, onChange, isEditing, label, placeholder }: LineAuthorityFieldProps) => {
  const lineAuthorityOptions = ['life', 'accident', 'health'];
  
  const handleLineAuthorityChange = (authority: string) => {
    if (value.includes(authority)) {
      onChange(value.filter(auth => auth !== authority));
    } else {
      onChange([...value, authority]);
    }
  };

  const formatLineAuthorities = (authorities: string[]) => {
    if (!authorities || authorities.length === 0) return '-';
    
    return authorities.map(auth => 
      auth.charAt(0).toUpperCase() + auth.slice(1)
    ).join(', ');
  };

  return (
    <div className="space-y-2.5">
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      {isEditing ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full justify-between"
            >
              {value && value.length > 0 
                ? formatLineAuthorities(value)
                : placeholder}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full min-w-[200px]">
            {lineAuthorityOptions.map((option) => (
              <DropdownMenuCheckboxItem
                key={option}
                checked={value.includes(option)}
                onCheckedChange={() => handleLineAuthorityChange(option)}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <p className="text-base text-gray-900 pt-1">
          {value && value.length > 0
            ? formatLineAuthorities(value)
            : '-'}
        </p>
      )}
    </div>
  );
};

export default LineAuthorityField;
