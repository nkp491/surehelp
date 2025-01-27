import interact from "interactjs";
import { snapToGrid } from "@/utils/gridUtils";
import { useCallback, useRef } from "react";
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
  const interactableRef = useRef<any>(null);

  const constrainPosition = useCallback((x: number, y: number): Position => {
    const gridSize = 8;
    const maxX = 832 - gridSize;
    const maxY = 1300 - gridSize;

    return {
      x: Math.max(0, Math.min(x, maxX)),
      y: Math.max(0, Math.min(y, maxY))
    };
  }, []);

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
    const x = parseFloat(target.getAttribute('data-x') || '0') + event.dx;
    const y = parseFloat(target.getAttribute('data-y') || '0') + event.dy;
    
    const constrained = constrainPosition(x, y);
    const snappedX = snapToGrid(constrained.x);
    const snappedY = snapToGrid(constrained.y);
    
    target.style.transform = `translate(${snappedX}px, ${snappedY}px)`;
    target.setAttribute('data-x', snappedX.toString());
    target.setAttribute('data-y', snappedY.toString());

    const width = target.style.width;
    const height = target.style.height;
    savePosition(fieldId, snappedX, snappedY, width, height);
  }, [fieldId, savePosition, constrainPosition]);

  const handleResizeMove = useCallback((event: Interact.ResizeEvent) => {
    const target = event.target as HTMLElement;
    const x = parseFloat(target.getAttribute('data-x') || '0');
    const y = parseFloat(target.getAttribute('data-y') || '0');
    
    const newWidth = snapToGrid(event.rect.width);
    const newHeight = snapToGrid(event.rect.height);
    
    Object.assign(target.style, {
      width: `${newWidth}px`,
      height: `${newHeight}px`,
      transform: `translate(${x}px, ${y}px)`
    });

    savePosition(fieldId, x, y, `${newWidth}px`, `${newHeight}px`);
  }, [fieldId, savePosition]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isEditMode || !isSelected || !elementRef.current) return;
    
    const element = elementRef.current;
    const x = parseFloat(element.getAttribute('data-x') || '0');
    const y = parseFloat(element.getAttribute('data-y') || '0');
    const gridSize = 8;
    let newX = x;
    let newY = y;

    switch (e.key) {
      case 'ArrowLeft':
        newX = x - gridSize;
        break;
      case 'ArrowRight':
        newX = x + gridSize;
        break;
      case 'ArrowUp':
        newY = y - gridSize;
        break;
      case 'ArrowDown':
        newY = y + gridSize;
        break;
      default:
        return;
    }

    const constrained = constrainPosition(newX, newY);
    const snappedX = snapToGrid(constrained.x);
    const snappedY = snapToGrid(constrained.y);
    
    element.style.transform = `translate(${snappedX}px, ${snappedY}px)`;
    element.setAttribute('data-x', snappedX.toString());
    element.setAttribute('data-y', snappedY.toString());

    const width = element.style.width;
    const height = element.style.height;
    savePosition(fieldId, snappedX, snappedY, width, height);

    e.preventDefault();
  }, [isEditMode, isSelected, elementRef, fieldId, savePosition, constrainPosition]);

  const initializeDragAndResize = useCallback(() => {
    const element = elementRef.current;
    if (!element || !isEditMode) return;

    // Get initial transform values from the style
    const transform = element.style.transform;
    const match = transform.match(/translate\((-?\d+(?:\.\d+)?)px,\s*(-?\d+(?:\.\d+)?)px\)/);
    if (match) {
      const [, x, y] = match;
      element.setAttribute('data-x', x);
      element.setAttribute('data-y', y);
    }

    // Cleanup previous interactable if it exists
    if (interactableRef.current) {
      interactableRef.current.unset();
    }

    // Create new interactable
    interactableRef.current = interact(element)
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

    // Handle keyboard events for selected elements
    if (isSelected) {
      element.tabIndex = 0;
      element.focus();
      element.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      if (interactableRef.current) {
        interactableRef.current.unset();
      }
      if (isSelected && element) {
        element.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [isEditMode, isSelected, handleDragMove, handleResizeMove, handleKeyDown]);

  return { initializeDragAndResize };
};