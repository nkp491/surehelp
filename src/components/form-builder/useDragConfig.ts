import interact from "interactjs";
import { snapToGrid, constrainPosition, GRID_SIZE } from "@/utils/gridUtils";
import { useCallback, useRef, useEffect } from "react";

interface DragConfigProps {
  fieldId: string;
  containerRef: React.RefObject<HTMLDivElement>;
  savePosition: (id: string, x: number, y: number, width: number, height: number) => void;
  resizable?: boolean;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  initialPosition?: { x: number; y: number; width: number; height: number };
}

export const useDragConfig = ({
  fieldId,
  containerRef,
  savePosition,
  resizable = false,
  minWidth = 100,
  minHeight = 40,
  maxWidth = 800,
  maxHeight = 600,
  initialPosition
}: DragConfigProps) => {
  const interactInstance = useRef<any>(null);
  
  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (interactInstance.current) {
        interactInstance.current.unset();
        interactInstance.current = null;
      }
    }
  }, [fieldId]);

  const handleDragMove = useCallback((event: any) => {
    const target = event.target as HTMLElement;
    const x = parseFloat(target.getAttribute('data-x') || '0') + event.dx;
    const y = parseFloat(target.getAttribute('data-y') || '0') + event.dy;
    
    // Snap to grid - use the correct signature for snapToGrid
    const snappedX = snapToGrid(x);
    const snappedY = snapToGrid(y);
    
    // Apply constraint to keep within container
    const width = parseFloat(target.style.width || target.offsetWidth.toString());
    const height = parseFloat(target.style.height || target.offsetHeight.toString());
    const constrained = constrainPosition(snappedX, snappedY);
    
    // Update element style and position attributes
    target.style.transform = `translate(${constrained.x}px, ${constrained.y}px)`;
    target.setAttribute('data-x', constrained.x.toString());
    target.setAttribute('data-y', constrained.y.toString());
    
    // Save position for persistence
    savePosition(fieldId, constrained.x, constrained.y, width, height);
  }, [fieldId, savePosition, containerRef]);

  const handleResizeMove = useCallback((event: any) => {
    const target = event.target as HTMLElement;
    const x = parseFloat(target.getAttribute('data-x') || '0');
    const y = parseFloat(target.getAttribute('data-y') || '0');
    
    // Update width based on snap grid
    let width = Math.max(minWidth, parseFloat(event.rect.width));
    let height = Math.max(minHeight, parseFloat(event.rect.height));
    
    width = Math.round(width / GRID_SIZE) * GRID_SIZE;
    height = Math.round(height / GRID_SIZE) * GRID_SIZE;
    
    width = Math.min(maxWidth, width);
    height = Math.min(maxHeight, height);
    
    // Update style
    target.style.width = `${width}px`;
    target.style.height = `${height}px`;
    target.style.transform = `translate(${x}px, ${y}px)`;
    
    // Save the position and dimensions
    savePosition(fieldId, x, y, width, height);
  }, [fieldId, minWidth, minHeight, maxWidth, maxHeight, savePosition]);

  const initDragAndResize = useCallback((element: HTMLElement) => {
    if (!element) return;
    
    if (interactInstance.current) {
      interactInstance.current.unset();
    }
    
    // Set initial position if provided
    if (initialPosition) {
      const { x, y, width, height } = initialPosition;
      element.style.transform = `translate(${x}px, ${y}px)`;
      element.setAttribute('data-x', x.toString());
      element.setAttribute('data-y', y.toString());
      
      if (width && height) {
        element.style.width = `${width}px`;
        element.style.height = `${height}px`;
      }
    }
    
    // Enable dragging
    const draggableElement = interact(element);
    
    draggableElement.draggable({
      inertia: false,
      modifiers: [
        interact.modifiers.restrictRect({
          restriction: containerRef.current || 'parent',
          endOnly: true
        })
      ],
      autoScroll: true,
      listeners: {
        move: handleDragMove
      }
    });
    
    // Enable resizing if needed
    if (resizable) {
      draggableElement.resizable({
        edges: { left: false, right: true, bottom: true, top: false },
        modifiers: [
          interact.modifiers.restrictSize({
            min: { width: minWidth, height: minHeight },
            max: { width: maxWidth, height: maxHeight }
          }),
          interact.modifiers.restrictRect({
            restriction: containerRef.current || 'parent'
          })
        ],
        inertia: false,
        listeners: {
          move: handleResizeMove
        }
      });
    }
    
    interactInstance.current = draggableElement;
    
  }, [
    containerRef, 
    handleDragMove, 
    handleResizeMove, 
    minWidth, 
    minHeight, 
    maxWidth, 
    maxHeight, 
    resizable, 
    initialPosition
  ]);

  return { initDragAndResize };
};
