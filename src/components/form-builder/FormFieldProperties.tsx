import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FormFieldPropertiesProps {
  open: boolean;
  onClose: () => void;
  selectedField: {
    id: string;
    width: string;
    height: string;
    alignment: string;
  } | null;
  onUpdate: (updates: {
    width?: string;
    height?: string;
    alignment?: string;
  }) => void;
}

const FormFieldProperties = ({
  open,
  onClose,
  selectedField,
  onUpdate,
}: FormFieldPropertiesProps) => {
  if (!selectedField) return null;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Field Properties</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Width</Label>
            <Input
              type="text"
              value={selectedField.width || ""}
              onChange={(e) => onUpdate({ width: e.target.value })}
              placeholder="e.g., 200px or 50%"
            />
          </div>
          <div className="space-y-2">
            <Label>Height</Label>
            <Input
              type="text"
              value={selectedField.height || ""}
              onChange={(e) => onUpdate({ height: e.target.value })}
              placeholder="e.g., 40px"
            />
          </div>
          <div className="space-y-2">
            <Label>Alignment</Label>
            <Select
              value={selectedField.alignment}
              onValueChange={(value) => onUpdate({ alignment: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select alignment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default FormFieldProperties;