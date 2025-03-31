
import React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronDown, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

type StatesFieldProps = {
  value: string[] | string;
  onChange: (states: string[] | string) => void;
  isEditing: boolean;
  label: string;
  placeholder: string;
  multiSelect?: boolean;
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

const StatesField = ({ 
  value, 
  onChange, 
  isEditing, 
  label, 
  placeholder,
  multiSelect = true 
}: StatesFieldProps) => {
  // Convert string to array for consistent internal handling
  const valuesArray = multiSelect ? (value as string[]) : (value ? [value as string] : []);

  const handleStateChange = (state: string) => {
    if (multiSelect) {
      if (valuesArray.includes(state)) {
        onChange(valuesArray.filter(s => s !== state));
      } else {
        onChange([...valuesArray, state]);
      }
    } else {
      // Single select mode just sets the value directly
      onChange(state);
    }
  };

  const removeState = (state: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (multiSelect) {
      onChange(valuesArray.filter(s => s !== state));
    } else {
      onChange("");
    }
  };

  // Get display text for dropdown button
  const getButtonText = () => {
    if (valuesArray.length === 0) return placeholder;
    
    if (multiSelect) {
      return `${valuesArray.length} state${valuesArray.length !== 1 ? 's' : ''} selected`;
    } else {
      return valuesArray[0];
    }
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
              {getButtonText()}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full min-w-[240px]">
            <ScrollArea className="h-[300px]">
              {US_STATES.map((state) => (
                multiSelect ? (
                  <DropdownMenuCheckboxItem
                    key={state}
                    checked={valuesArray.includes(state)}
                    onCheckedChange={() => handleStateChange(state)}
                  >
                    {state}
                  </DropdownMenuCheckboxItem>
                ) : (
                  <DropdownMenuRadioItem
                    key={state}
                    value={state}
                    onSelect={() => handleStateChange(state)}
                  >
                    {state}
                  </DropdownMenuRadioItem>
                )
              ))}
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <>
          {valuesArray.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {valuesArray.map((state) => (
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
      
      {isEditing && valuesArray.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {valuesArray.map((state) => (
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
