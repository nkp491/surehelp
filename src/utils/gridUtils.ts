const GRID_SIZE = 32; // 32px grid for better spacing
const MAX_WIDTH = 1600; // Increased from 1056 to accommodate more fields
const MAX_HEIGHT = 1200; // Increased from 816 to accommodate more fields

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
    x: Math.min(Math.max(0, x), MAX_WIDTH - GRID_SIZE),
    y: Math.min(Math.max(0, y), MAX_HEIGHT - GRID_SIZE)
  };
};