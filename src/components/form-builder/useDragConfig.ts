import interact from "interactjs";
import { snapToGrid } from "@/utils/gridUtils";

export const useDragConfig = (elementRef: React.RefObject<HTMLDivElement>, isEditMode: boolean) => {
  const initializeDragAndResize = () => {
    if (!elementRef.current || !isEditMode) return;

    const interactable = interact(elementRef.current)
      .draggable({
        inertia: false,
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
            const target = event.target as HTMLElement;
            target.style.zIndex = '1000';
            target.style.opacity = '0.8';
            target.style.transform = target.style.transform || 'translate(0px, 0px)';
            target.style.transition = 'none';
            
            // Store initial position
            const rect = target.getBoundingClientRect();
            target.setAttribute('data-x', rect.left.toString());
            target.setAttribute('data-y', rect.top.toString());
          },
          move: (event) => {
            const target = event.target as HTMLElement;
            const x = (parseFloat(target.getAttribute('data-x') || '0') || 0) + event.dx;
            const y = (parseFloat(target.getAttribute('data-y') || '0') || 0) + event.dy;

            const newX = snapToGrid(x);
            const newY = snapToGrid(y);

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