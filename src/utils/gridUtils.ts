const GRID_SIZE = 32; // 32px grid for better spacing

export const snapToGrid = (value: number): number => {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
};

export const getRelativePosition = (event: any, element: HTMLElement) => {
  const rect = element.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  return { x: snapToGrid(x), y: snapToGrid(y) };
};

// Minimum width for fields (2 grid units)
export const MIN_FIELD_WIDTH = GRID_SIZE * 2;

// Maximum width for fields (20 grid units)
export const MAX_FIELD_WIDTH = GRID_SIZE * 20;

// Ensure width is within bounds and snapped to grid
export const constrainFieldWidth = (width: number): number => {
  const snapped = snapToGrid(width);
  return Math.max(MIN_FIELD_WIDTH, Math.min(snapped, MAX_FIELD_WIDTH));
};