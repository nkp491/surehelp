
import React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronDown, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

type StatesFieldProps = {
  value: string[];
  onChange: (states: string[]) => void;
  isEditing: boolean;
  label: string;
  placeholder: string;
};

// All US states plus DC
const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", 
  "Colorado", "Connecticut", "Delaware", "District of Columbia", "Florida",
  "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", 
  "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", 
  "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", 
  "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", 
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", 
  "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", 
  "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", 
  "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", 
  "Wyoming"
];

const StatesField = ({ value, onChange, isEditing, label, placeholder }: StatesFieldProps) => {
  const handleStateChange = (state: string) => {
    if (value.includes(state)) {
      onChange(value.filter(s => s !== state));
    } else {
      onChange([...value, state]);
    }
  };

  const removeState = (state: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter(s => s !== state));
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
                ? `${value.length} state${value.length !== 1 ? 's' : ''} selected`
                : placeholder}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full min-w-[240px]">
            <ScrollArea className="h-[300px]">
              {US_STATES.map((state) => (
                <DropdownMenuCheckboxItem
                  key={state}
                  checked={value.includes(state)}
                  onCheckedChange={() => handleStateChange(state)}
                >
                  {state}
                </DropdownMenuCheckboxItem>
              ))}
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <>
          {value && value.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {value.map((state) => (
                <Badge key={state} variant="secondary">
                  {state}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-base text-gray-900 pt-1">-</p>
          )}
        </>
      )}
      
      {isEditing && value.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {value.map((state) => (
            <Badge key={state} variant="secondary" className="flex items-center gap-1">
              {state}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={(e) => removeState(state, e)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default StatesField;
