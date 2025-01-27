import interact from "interactjs";
import { snapToGrid, constrainPosition } from "@/utils/gridUtils";

export const useDragConfig = (elementRef: React.RefObject<HTMLDivElement>, isEditMode: boolean) => {
  const handleKeyboardNavigation = (event: KeyboardEvent) => {
    if (!elementRef.current || !isEditMode) return;
    
    const target = elementRef.current;
    const transform = target.style.transform;
    const matches = transform.match(/translate\((-?\d+)px,\s*(-?\d+)px\)/);
    const currentX = matches ? parseInt(matches[1]) : 0;
    const currentY = matches ? parseInt(matches[2]) : 0;
    
    const STEP = 16;
    let newX = currentX;
    let newY = currentY;

    switch (event.key) {
      case 'ArrowLeft':
        newX = currentX - STEP;
        break;
      case 'ArrowRight':
        newX = currentX + STEP;
        break;
      case 'ArrowUp':
        newY = currentY - STEP;
        break;
      case 'ArrowDown':
        newY = currentY + STEP;
        break;
      default:
        return;
    }

    const constrained = constrainPosition(newX, newY);
    target.style.transform = `translate(${constrained.x}px, ${constrained.y}px)`;
    target.setAttribute('data-x', constrained.x.toString());
    target.setAttribute('data-y', constrained.y.toString());
    event.preventDefault();
  };

  const configureDraggable = (interactable: Interact.Interactable) => {
    return interactable.draggable({
      inertia: false,
      modifiers: [
        interact.modifiers.restrictRect({
          restriction: 'parent',
          endOnly: true
        })
      ],
      autoScroll: true,
      listeners: {
        start: handleDragStart,
        move: handleDragMove,
        end: handleDragEnd
      }
    });
  };

  const configureResizable = (interactable: Interact.Interactable) => {
    return interactable.resizable({
      edges: { left: true, right: true, bottom: true, top: true },
      modifiers: [
        interact.modifiers.restrictSize({
          min: { width: 208, height: 64 }
        }),
        interact.modifiers.restrictEdges({
          outer: 'parent',
          endOnly: true
        }),
        interact.modifiers.snap({
          targets: [
            interact.snappers.grid({ x: 16, y: 16 })
          ],
          range: 10,
          relativePoints: [{ x: 0, y: 0 }]
        }),
      ],
      inertia: false,
      listeners: {
        move: handleResizeMove
      }
    });
  };

  const handleDragStart = (event: Interact.InteractEvent) => {
    const target = event.target as HTMLElement;
    target.style.zIndex = '1000';
    target.style.opacity = '0.8';
    
    const transform = target.style.transform;
    const matches = transform.match(/translate\((-?\d+)px,\s*(-?\d+)px\)/);
    const currentX = matches ? parseInt(matches[1]) : 0;
    const currentY = matches ? parseInt(matches[2]) : 0;
    
    target.setAttribute('data-initial-x', currentX.toString());
    target.setAttribute('data-initial-y', currentY.toString());
    target.setAttribute('data-x', currentX.toString());
    target.setAttribute('data-y', currentY.toString());
    
    target.style.transition = 'none';
  };

  const handleDragMove = (event: Interact.InteractEvent) => {
    const target = event.target as HTMLElement;
    const initialX = parseFloat(target.getAttribute('data-initial-x') || '0');
    const initialY = parseFloat(target.getAttribute('data-initial-y') || '0');
    
    const x = initialX + event.dx;
    const y = initialY + event.dy;

    const constrained = constrainPosition(x, y);
    const newX = snapToGrid(constrained.x);
    const newY = snapToGrid(constrained.y);

    updateElementPosition(target, newX, newY);
  };

  const handleDragEnd = (event: Interact.InteractEvent) => {
    const target = event.target as HTMLElement;
    target.style.zIndex = 'auto';
    target.style.opacity = '1';
    target.style.transition = 'transform 0.2s ease-out';
    
    const finalX = target.getAttribute('data-x');
    const finalY = target.getAttribute('data-y');
    target.setAttribute('data-initial-x', finalX || '0');
    target.setAttribute('data-initial-y', finalY || '0');
  };

  const handleResizeMove = (event: Interact.InteractEvent) => {
    let { x, y } = event.target.dataset;
    
    x = (parseFloat(x) || 0) + event.deltaRect.left;
    y = (parseFloat(y) || 0) + event.deltaRect.top;

    const constrained = constrainPosition(x, y);
    
    Object.assign(event.target.style, {
      width: `${snapToGrid(event.rect.width)}px`,
      height: `${snapToGrid(event.rect.height)}px`,
      transform: `translate(${snapToGrid(constrained.x)}px, ${snapToGrid(constrained.y)}px)`
    });

    Object.assign(event.target.dataset, { x: constrained.x, y: constrained.y });
  };

  const updateElementPosition = (element: HTMLElement, x: number, y: number) => {
    element.style.transform = `translate(${x}px, ${y}px)`;
    element.setAttribute('data-x', x.toString());
    element.setAttribute('data-y', y.toString());
  };

  const initializeDragAndResize = () => {
    if (!elementRef.current || !isEditMode) return;

    const interactable = interact(elementRef.current);
    configureDraggable(interactable);
    configureResizable(interactable);

    elementRef.current.tabIndex = 0;
    elementRef.current.addEventListener('keydown', handleKeyboardNavigation);

    return () => {
      if (elementRef.current) {
        elementRef.current.removeEventListener('keydown', handleKeyboardNavigation);
      }
      interactable.unset();
    };
  };

  return { initializeDragAndResize };
};