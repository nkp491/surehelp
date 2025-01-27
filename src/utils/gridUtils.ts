export const GRID_SIZE = 8; // Adjusted for better snapping
const MAX_WIDTH = 832;
const MAX_HEIGHT = 1300;

export const snapToGrid = (value: number): number => {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
};

export const getRelativePosition = (event: any, element: HTMLElement) => {
  const rect = element.getBoundingClientRect();
  const x = Math.min(Math.max(0, event.clientX - rect.left), MAX_WIDTH - GRID_SIZE);
  const y = Math.min(Math.max(0, event.clientY - rect.top), MAX_HEIGHT - GRID_SIZE);
  return { x: snapToGrid(x), y: snapToGrid(y) };
};

export const constrainPosition = (x: number, y: number): { x: number, y: number } => {
  // Allow movement in all directions while keeping within bounds
  const snappedX = snapToGrid(x);
  const snappedY = snapToGrid(y);
  
  return {
    x: Math.max(0, Math.min(snappedX, MAX_WIDTH - GRID_SIZE)),
    y: Math.max(0, Math.min(snappedY, MAX_HEIGHT - GRID_SIZE))
  };
};
