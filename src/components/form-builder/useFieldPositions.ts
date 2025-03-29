
import { useState } from "react";
import { DragEndEvent } from "@dnd-kit/core";
import { FormField } from "@/types/formTypes";
import { snapToGrid } from "@/utils/gridUtils";
import { useLoadFieldPositions } from "@/hooks/form-builder/useLoadFieldPositions";
import { useSaveFieldPosition } from "@/hooks/form-builder/useSaveFieldPosition";
import { useUpdateFieldProperties } from "@/hooks/form-builder/useUpdateFieldProperties";

interface UseFieldPositionsProps {
  section: string;
  fields: FormField[];
  selectedField: string | null;
}

export const useFieldPositions = ({ section, fields, selectedField }: UseFieldPositionsProps) => {
  const { fieldPositions, setFieldPositions } = useLoadFieldPositions(section);
  const { savePosition } = useSaveFieldPosition(section, fields);
  const { updateProperties } = useUpdateFieldProperties(section, fields, selectedField);

  const handleDragEnd = async (event: any) => {
    const { active, delta } = event;
    if (!active) return;

    const fieldId = active.id as string;
    const currentPosition = fieldPositions[fieldId] || {};
    
    const newX = snapToGrid(Math.round((currentPosition.x_position || 0) + delta.x));
    const newY = snapToGrid(Math.round((currentPosition.y_position || 0) + delta.y));

    await savePosition(fieldId, newX, newY, setFieldPositions);
  };

  const updateFieldProperties = async (updates: {
    width?: string;
    height?: string;
    alignment?: string;
  }) => {
    await updateProperties(updates, setFieldPositions);
  };

  return {
    fieldPositions,
    setFieldPositions,
    handleDragEnd,
    updateFieldProperties,
  };
};
