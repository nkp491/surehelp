import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[#FFF9EE] text-[#2A6F97] border-2 border-[#2A6F97] hover:bg-[#2A6F97] hover:text-[#FFF9EE] font-semibold",
        destructive:
          "bg-[#FDF0D5] text-destructive border-2 border-destructive hover:bg-destructive hover:text-[#FFF9EE] font-semibold",
        outline:
          "border-2 border-[#2A6F97] bg-[#FFF9EE] text-[#2A6F97] hover:bg-[#2A6F97] hover:text-[#FFF9EE] font-semibold",
        secondary:
          "bg-[#FDF0D5] text-[#2A6F97] border-2 border-[#2A6F97] hover:bg-[#2A6F97] hover:text-[#FFF9EE] font-semibold",
        ghost: "text-[#2A6F97] hover:bg-[#2A6F97]/10 font-semibold",
        link: "text-[#2A6F97] underline-offset-4 hover:underline font-semibold",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }