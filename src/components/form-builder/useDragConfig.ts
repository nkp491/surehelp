import interact from "interactjs";
import { snapToGrid } from "@/utils/gridUtils";
import { useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Position {
  x: number;
  y: number;
}

export const useDragConfig = (
  elementRef: React.RefObject<HTMLElement>,
  isEditMode: boolean,
  fieldId: string,
  isSelected: boolean
) => {
  const constrainPosition = (x: number, y: number): Position => {
    const gridSize = 8;
    const maxX = 832 - gridSize;
    const maxY = 1300 - gridSize;

    return {
      x: Math.max(0, Math.min(x, maxX)),
      y: Math.max(0, Math.min(y, maxY))
    };
  };

  const savePosition = useCallback(async (
    fieldId: string, 
    x: number, 
    y: number, 
    width: string, 
    height: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('form_field_positions')
        .upsert({
          user_id: user.id,
          field_id: fieldId,
          section: 'Combined Form',
          position: 0,
          x_position: Math.round(x),
          y_position: Math.round(y),
          width,
          height,
        }, {
          onConflict: 'user_id,field_id,section'
        });

      if (error) {
        console.error('Error saving position:', error);
      }
    } catch (error) {
      console.error('Error in savePosition:', error);
    }
  }, []);

  const handleDragMove = useCallback((event: Interact.InteractEvent) => {
    const target = event.target as HTMLElement;
    const currentX = parseFloat(target.dataset.x || '0');
    const currentY = parseFloat(target.dataset.y || '0');
    
    const deltaX = event.dx;
    const deltaY = event.dy;
    
    const newX = currentX + deltaX;
    const newY = currentY + deltaY;

    const constrained = constrainPosition(newX, newY);
    
    Object.assign(target.style, {
      transform: `translate(${snapToGrid(constrained.x)}px, ${snapToGrid(constrained.y)}px)`
    });

    target.dataset.x = constrained.x.toString();
    target.dataset.y = constrained.y.toString();

    const width = target.style.width;
    const height = target.style.height;
    savePosition(fieldId, constrained.x, constrained.y, width, height);
  }, [fieldId, savePosition]);

  const handleResizeMove = useCallback((event: Interact.ResizeEvent) => {
    const target = event.target as HTMLElement;
    const currentX = parseFloat(target.dataset.x || '0');
    const currentY = parseFloat(target.dataset.y || '0');
    
    const deltaX = event.deltaRect?.left || 0;
    const deltaY = event.deltaRect?.top || 0;
    
    const newX = currentX + deltaX;
    const newY = currentY + deltaY;

    const constrained = constrainPosition(newX, newY);
    
    const newWidth = `${snapToGrid(event.rect.width)}px`;
    const newHeight = `${snapToGrid(event.rect.height)}px`;

    Object.assign(target.style, {
      width: newWidth,
      height: newHeight,
      transform: `translate(${snapToGrid(constrained.x)}px, ${snapToGrid(constrained.y)}px)`
    });

    target.dataset.x = constrained.x.toString();
    target.dataset.y = constrained.y.toString();

    savePosition(fieldId, constrained.x, constrained.y, newWidth, newHeight);
  }, [fieldId, savePosition]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isEditMode || !isSelected || !elementRef.current) return;
    
    const element = elementRef.current;
    const currentX = parseFloat(element.dataset.x || '0');
    const currentY = parseFloat(element.dataset.y || '0');
    const gridSize = 8;
    let newX = currentX;
    let newY = currentY;

    switch (e.key) {
      case 'ArrowLeft':
        newX = currentX - gridSize;
        break;
      case 'ArrowRight':
        newX = currentX + gridSize;
        break;
      case 'ArrowUp':
        newY = currentY - gridSize;
        break;
      case 'ArrowDown':
        newY = currentY + gridSize;
        break;
      default:
        return;
    }

    const constrained = constrainPosition(newX, newY);
    
    Object.assign(element.style, {
      transform: `translate(${snapToGrid(constrained.x)}px, ${snapToGrid(constrained.y)}px)`
    });

    element.dataset.x = constrained.x.toString();
    element.dataset.y = constrained.y.toString();

    const width = element.style.width;
    const height = element.style.height;
    savePosition(fieldId, constrained.x, constrained.y, width, height);

    e.preventDefault();
  }, [isEditMode, isSelected, elementRef, fieldId, savePosition]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !isEditMode) return;

    const interactable = interact(element)
      .draggable({
        inertia: false,
        modifiers: [],
        autoScroll: true,
        listeners: { move: handleDragMove }
      })
      .resizable({
        edges: { left: true, right: true, bottom: true, top: true },
        listeners: { move: handleResizeMove }
      });

    if (isSelected) {
      element.tabIndex = 0;
      element.focus();
      element.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      interactable.unset();
      if (isSelected) {
        element.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [isEditMode, isSelected, handleDragMove, handleResizeMove, handleKeyDown, elementRef]);

  return { initializeDragAndResize: useCallback(() => {}, []) };
};