const GRID_SIZE = 16; // 16px grid for better spacing

export const snapToGrid = (value: number): number => {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
};

export const getRelativePosition = (event: any, element: HTMLElement) => {
  const rect = element.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  return { x: snapToGrid(x), y: snapToGrid(y) };
};