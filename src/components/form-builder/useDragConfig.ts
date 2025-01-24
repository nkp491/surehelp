import interact from "interactjs";
import { snapToGrid } from "@/utils/gridUtils";

export const useDragConfig = (elementRef: React.RefObject<HTMLDivElement>, isEditMode: boolean) => {
  const initializeDragAndResize = () => {
    if (!elementRef.current || !isEditMode) return;

    const position = { x: 0, y: 0 };

    const interactable = interact(elementRef.current)
      .draggable({
        inertia: true,
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
          start: () => {
            if (elementRef.current) {
              elementRef.current.style.zIndex = '1000';
              elementRef.current.style.opacity = '0.8';
              elementRef.current.style.transform = elementRef.current.style.transform || 'translate(0px, 0px)';
            }
          },
          move: (event) => {
            position.x += event.dx;
            position.y += event.dy;

            if (event.target) {
              const currentTransform = event.target.style.transform;
              const matches = currentTransform.match(/translate\((-?\d+)px,\s*(-?\d+)px\)/);
              const currentX = matches ? parseInt(matches[1]) : 0;
              const currentY = matches ? parseInt(matches[2]) : 0;

              const newX = snapToGrid(currentX + event.dx);
              const newY = snapToGrid(currentY + event.dy);

              event.target.style.transform = `translate(${newX}px, ${newY}px)`;
              event.target.style.transition = 'none';
            }
          },
          end: () => {
            if (elementRef.current) {
              elementRef.current.style.zIndex = 'auto';
              elementRef.current.style.opacity = '1';
              elementRef.current.style.transition = 'transform 0.2s ease-out';
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
        inertia: true,
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