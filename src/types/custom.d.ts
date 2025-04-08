
// Type declarations to fix build issues without modifying tsconfig.json

// React JSX runtime
declare namespace JSX {
  interface IntrinsicElements {
    // Add any missing JSX elements if needed
  }
}

// Fix Badge component issues
declare module "@/components/ui/badge" {
  export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info";
    children?: React.ReactNode;
  }
}

// Extend component key props to fix TypeScript key warnings
interface KeyedComponentProps {
  key?: React.Key;
}

// Declare missing module types
declare module "*.svg" {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export default content;
}

declare module "*.png" {
  const content: string;
  export default content;
}

declare module "*.jpg" {
  const content: string;
  export default content;
}

// Make TypeScript understand JSX without modifying tsconfig
declare module "react/jsx-runtime" {
  export default {}; 
  export function jsx(type: any, props: any): any;
  export function jsxs(type: any, props: any): any;
}
