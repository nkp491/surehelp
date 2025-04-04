
import React from "react";

/**
 * Utility type to extend component props with common properties
 * This solves the type errors with shadcn/ui components
 */
export type ExtendedProps<T, E = {}> = T & {
  className?: string;
  children?: React.ReactNode;
} & E;
