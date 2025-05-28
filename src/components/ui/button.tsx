import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "st-inline-flex st-items-center st-justify-center st-gap-2 st-whitespace-nowrap st-rounded-md st-text-sm st-font-medium st-ring-offset-background st-transition-colors st-focus-visible:outline-none st-focus-visible:ring-2 st-focus-visible:ring-ring st-focus-visible:ring-offset-2 st-disabled:pointer-events-none st-disabled:opacity-50 [&_svg]:st-pointer-events-none [&_svg]:st-size-4 [&_svg]:st-shrink-0",
    {
        variants: {
            variant: {
                default: "st-bg-primary st-text-primary-foreground st-hover:bg-primary/90",
                destructive: "st-bg-destructive st-text-destructive-foreground st-hover:bg-destructive/90",
                outline: "st-border st-border-input st-bg-background st-hover:bg-accent st-hover:text-accent-foreground",
                secondary: "st-bg-secondary st-text-secondary-foreground st-hover:bg-secondary/80",
                ghost: "st-hover:bg-accent st-hover:text-accent-foreground",
                link: "st-text-primary st-underline-offset-4 st-hover:underline",
            },
            size: {
                default: "st-h-10 st-px-4 st-py-2",
                sm: "st-h-9 st-rounded-md st-px-3",
                lg: "st-h-11 st-rounded-md st-px-8",
                icon: "st-h-10 st-w-10",
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
