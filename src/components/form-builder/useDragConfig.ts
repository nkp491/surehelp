import interact from "interactjs";
import { snapToGrid } from "@/utils/gridUtils";

export const useDragConfig = (elementRef: React.RefObject<HTMLDivElement>, isEditMode: boolean) => {
  const initializeDragAndResize = () => {
    if (!elementRef.current || !isEditMode) return;

    const interactable = interact(elementRef.current)
      .draggable({
        inertia: false, // Disable inertia for more precise control
        modifiers: [
          interact.modifiers.restrictRect({
            restriction: 'parent',
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
        autoScroll: true,
        listeners: {
          start: (event) => {
            if (event.target) {
              event.target.style.zIndex = '1000';
              event.target.style.opacity = '0.8';
              event.target.style.transform = event.target.style.transform || 'translate(0px, 0px)';
              event.target.style.transition = 'none'; // Disable transitions while dragging
            }
          },
          move: (event) => {
            if (event.target) {
              const currentTransform = event.target.style.transform;
              const matches = currentTransform.match(/translate\((-?\d+)px,\s*(-?\d+)px\)/);
              const currentX = matches ? parseInt(matches[1]) : 0;
              const currentY = matches ? parseInt(matches[2]) : 0;

              const newX = snapToGrid(currentX + event.dx);
              const newY = snapToGrid(currentY + event.dy);

              event.target.style.transform = `translate(${newX}px, ${newY}px)`;
              
              // Update data attributes for position tracking
              event.target.setAttribute('data-x', newX.toString());
              event.target.setAttribute('data-y', newY.toString());
            }
          },
          end: (event) => {
            if (event.target) {
              event.target.style.zIndex = 'auto';
              event.target.style.opacity = '1';
              event.target.style.transition = 'transform 0.2s ease-out'; // Re-enable transitions
            }
          }
        }
      })
      .resizable({
        edges: { left: true, right: true, bottom: true, top: true },
        modifiers: [
          interact.modifiers.restrictSize({
            min: { width: 200, height: 50 }
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

            Object.assign(event.target.style, {
              width: `${snapToGrid(event.rect.width)}px`,
              height: `${snapToGrid(event.rect.height)}px`,
              transform: `translate(${snapToGrid(x)}px, ${snapToGrid(y)}px)`
            });

            Object.assign(event.target.dataset, { x, y });
          }
        }
      });

    return () => {
      interactable.unset();
    };
  };

  return { initializeDragAndResize };
};