"use client"

import * as React from "react"
import * as TogglePrimitive from "@radix-ui/react-toggle"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const toggleVariants = cva(
  "inline-flex st-items-center st-justify-center st-rounded-md st-text-sm st-font-medium st-ring-offset-background st-transition-colors st-hover:bg-muted st-hover:text-muted-foreground focus-st-visible:outline-none focus-st-visible:ring-2 focus-st-visible:ring-ring focus-st-visible:ring-offset-2 disabled:st-pointer-events-none disabled:st-opacity-50 data-[state=on]:st-bg-accent data-[state=on]:st-text-accent-foreground [&_svg]:st-pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 st-gap-2",
  {
    variants: {
      variant: {
        default: "st-bg-transparent",
        outline:
          "border st-border-input st-bg-transparent st-hover:bg-accent st-hover:text-accent-foreground",
      },
      size: {
        default: "st-h-10 px-3 st-min-w-10",
        sm: "st-h-9 px-2.5 st-min-w-9",
        lg: "st-h-11 px-5 st-min-w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> &
    VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={cn(toggleVariants({ variant, size, className }))}
    {...props}
  />
))

Toggle.displayName = TogglePrimitive.Root.displayName

export { Toggle, toggleVariants }
