import interact from "interactjs";
import { snapToGrid } from "@/utils/gridUtils";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Position {
  x: number;
  y: number;
}

export const useDragConfig = (elementRef: React.RefObject<HTMLElement>, isEditMode: boolean) => {
  const savePosition = async (fieldId: string, x: number, y: number, width: string, height: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('form_field_positions')
        .upsert({
          user_id: user.id,
          field_id: fieldId,
          section: 'Combined Form',
          position: 0, // We're not using position for grid layout
          x_position: x,
          y_position: y,
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
  };

  const constrainPosition = (x: number, y: number): Position => {
    const gridSize = 16;
    const maxX = 1920 - gridSize; // Maximum width of the container
    const maxY = 1080 - gridSize; // Maximum height of the container

    return {
      x: Math.max(0, Math.min(x, maxX)),
      y: Math.max(0, Math.min(y, maxY))
    };
  };

  const handleDragMove = (event: Interact.InteractEvent) => {
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

    // Save position after drag
    const fieldId = target.getAttribute('data-field-id');
    if (fieldId) {
      const width = target.style.width;
      const height = target.style.height;
      savePosition(fieldId, constrained.x, constrained.y, width, height);
    }
  };

  const handleResizeMove = (event: Interact.ResizeEvent) => {
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

    // Save position and size after resize
    const fieldId = target.getAttribute('data-field-id');
    if (fieldId) {
      savePosition(fieldId, constrained.x, constrained.y, newWidth, newHeight);
    }
  };

  const updateElementPosition = (element: HTMLElement, x: number, y: number) => {
    const constrained = constrainPosition(x, y);
    
    Object.assign(element.style, {
      transform: `translate(${snapToGrid(constrained.x)}px, ${snapToGrid(constrained.y)}px)`
    });

    element.dataset.x = constrained.x.toString();
    element.dataset.y = constrained.y.toString();
  };

  const initializeDragAndResize = () => {
    const element = elementRef.current;
    if (!element) return () => {};

    if (isEditMode) {
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

      return () => {
        interactable.unset();
      };
    }

    return () => {};
  };

  return {
    initializeDragAndResize,
    updateElementPosition
  };
};