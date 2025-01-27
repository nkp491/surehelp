const GRID_SIZE = 16; // Adjusted for better snapping
const MAX_WIDTH = 3200;
const MAX_HEIGHT = 1200;

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
  return {
    x: Math.min(Math.max(0, snapToGrid(x)), MAX_WIDTH - GRID_SIZE),
    y: Math.min(Math.max(0, snapToGrid(y)), MAX_HEIGHT - GRID_SIZE)
  };
};