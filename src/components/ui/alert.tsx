import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
    "st-relative st-w-full st-rounded-lg st-border st-p-4 [&>svg~*]:st-pl-7 [&>svg+div]:st-translate-y-[-3px] [&>svg]:st-absolute [&>svg]:st-left-4 [&>svg]:st-top-4 [&>svg]:st-text-foreground",
    {
        variants: {
            variant: {
                default: "st-bg-background st-text-foreground",
                destructive:
                    "st-border-destructive/50 st-text-destructive dark:st-border-destructive [&>svg]:st-text-destructive",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h5
        ref={ref}
        className={cn("st-mb-1 st-font-medium st-leading-none st-tracking-tight", className)}
        {...props}
    />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("st-text-sm [&_p]:st-leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
