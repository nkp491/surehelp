import interact from "interactjs";
import { snapToGrid, constrainPosition } from "@/utils/gridUtils";

export const useDragConfig = (elementRef: React.RefObject<HTMLDivElement>, isEditMode: boolean) => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (!elementRef.current || !isEditMode) return;
    
    const target = elementRef.current;
    const transform = target.style.transform;
    const matches = transform.match(/translate\((-?\d+)px,\s*(-?\d+)px\)/);
    const currentX = matches ? parseInt(matches[1]) : 0;
    const currentY = matches ? parseInt(matches[2]) : 0;
    
    const STEP = 32; // Same as grid size
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

  const initializeDragAndResize = () => {
    if (!elementRef.current || !isEditMode) return;

    const interactable = interact(elementRef.current)
      .draggable({
        inertia: false,
        modifiers: [
          interact.modifiers.restrictRect({
            restriction: 'parent',
            endOnly: true
          })
        ],
        autoScroll: true,
        listeners: {
          start: (event) => {
            const target = event.target as HTMLElement;
            target.style.zIndex = '1000';
            target.style.opacity = '0.8';
            target.style.transform = target.style.transform || 'translate(0px, 0px)';
            target.style.transition = 'none';
            
            const transform = target.style.transform;
            const matches = transform.match(/translate\((-?\d+)px,\s*(-?\d+)px\)/);
            const currentX = matches ? parseInt(matches[1]) : 0;
            const currentY = matches ? parseInt(matches[2]) : 0;
            
            target.setAttribute('data-x', currentX.toString());
            target.setAttribute('data-y', currentY.toString());
          },
          move: (event) => {
            const target = event.target as HTMLElement;
            const x = (parseFloat(target.getAttribute('data-x') || '0') || 0) + event.dx;
            const y = (parseFloat(target.getAttribute('data-y') || '0') || 0) + event.dy;

            const constrained = constrainPosition(x, y);
            const newX = snapToGrid(constrained.x);
            const newY = snapToGrid(constrained.y);

            target.style.transform = `translate(${newX}px, ${newY}px)`;
            target.setAttribute('data-x', newX.toString());
            target.setAttribute('data-y', newY.toString());
          },
          end: (event) => {
            const target = event.target as HTMLElement;
            target.style.zIndex = 'auto';
            target.style.opacity = '1';
            target.style.transition = 'transform 0.2s ease-out';
          }
        }
      })
      .resizable({
        edges: { left: true, right: true, bottom: true, top: true },
        modifiers: [
          interact.modifiers.restrictSize({
            min: { width: 200, height: 50 }
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
          move: (event) => {
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
          }
        }
      });

    elementRef.current.tabIndex = 0;
    elementRef.current.addEventListener('keydown', handleKeyDown);

    return () => {
      if (elementRef.current) {
        elementRef.current.removeEventListener('keydown', handleKeyDown);
      }
      interactable.unset();
    };
  };

  return { initializeDragAndResize };
};