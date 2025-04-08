
import React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import * as LabelPrimitive from "@radix-ui/react-label";
import * as MenubarPrimitive from "@radix-ui/react-menubar";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import * as SelectPrimitive from "@radix-ui/react-select";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import * as SliderPrimitive from "@radix-ui/react-slider";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as ToastPrimitive from "@radix-ui/react-toast";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import * as TogglePrimitive from "@radix-ui/react-toggle";

// Fix the module augmentation to avoid recursive type references
declare module "@radix-ui/react-accordion" {
  interface AccordionItemProps extends React.ComponentPropsWithoutRef<"div"> {}
  
  interface AccordionTriggerProps extends React.ComponentPropsWithoutRef<"button"> {}
  
  interface AccordionContentProps extends React.ComponentPropsWithoutRef<"div"> {}
}

declare module "@radix-ui/react-alert-dialog" {
  interface AlertDialogOverlayProps extends React.ComponentPropsWithoutRef<"div"> {}
  
  interface AlertDialogTitleProps extends React.ComponentPropsWithoutRef<"h2"> {}
  
  interface AlertDialogDescriptionProps extends React.ComponentPropsWithoutRef<"div"> {}
  
  interface AlertDialogActionProps extends React.ComponentPropsWithoutRef<"button"> {}
  
  interface AlertDialogCancelProps extends React.ComponentPropsWithoutRef<"button"> {}
}

declare module "@radix-ui/react-avatar" {
  interface AvatarProps extends React.ComponentPropsWithoutRef<"div"> {}
  
  interface AvatarImageProps extends React.ComponentPropsWithoutRef<"img"> {}
  
  interface AvatarFallbackProps extends React.ComponentPropsWithoutRef<"div"> {}
}

declare module "@radix-ui/react-checkbox" {
  interface CheckboxProps extends React.ComponentPropsWithoutRef<"button"> {}
  
  interface CheckboxIndicatorProps extends React.ComponentPropsWithoutRef<"span"> {}
}

declare module "@radix-ui/react-collapsible" {
  interface CollapsibleProps extends React.ComponentPropsWithoutRef<"div"> {}
  
  interface CollapsibleTriggerProps extends React.ComponentPropsWithoutRef<"button"> {}
  
  interface CollapsibleContentProps extends React.ComponentPropsWithoutRef<"div"> {}
}

// Additional modules can be added here following the same pattern

// Adding overrides for button variant and size for shadcn components
declare module "@/components/ui/button" {
  interface ButtonProps {
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    size?: "default" | "sm" | "lg" | "icon";
  }
}

// Adding overrides for badge variant for shadcn components
declare module "@/components/ui/badge" {
  interface BadgeProps {
    variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info";
  }
}

// Export any utility types needed elsewhere
export interface ExtendedComponentProps {
  className?: string;
  children?: React.ReactNode;
}
