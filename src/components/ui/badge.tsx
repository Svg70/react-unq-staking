import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "st-inline-flex st-items-center st-rounded-full st-border st-px-2.5 st-py-0.5 st-text-xs st-font-semibold st-transition-colors st-focus:outline-none st-focus:ring-2 st-focus:ring-ring st-focus:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "st-border-transparent st-bg-primary st-text-primary-foreground st-hover:bg-primary/80",
                secondary:
                    "st-border-transparent st-bg-secondary st-text-secondary-foreground st-hover:bg-secondary/80",
                destructive:
                    "st-border-transparent st-bg-destructive st-text-destructive-foreground st-hover:bg-destructive/80",
                outline: "st-text-foreground",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
