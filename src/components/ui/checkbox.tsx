"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
        "st-peer st-h-4 st-w-4 st-shrink-0 st-rounded-sm st-border st-border-primary st-ring-offset-background focus-st-visible:st-outline-none focus-st-visible:st-ring-2 focus-st-visible:st-ring-ring focus-st-visible:st-ring-offset-2 disabled:st-cursor-not-allowed disabled:st-opacity-50 data-[state=checked]:st-bg-primary data-[state=checked]:st-text-primary-foreground",
        className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
        className={cn("st-flex st-items-center st-justify-center st-text-current")}
    >
      <Check className="st-h-4 st-w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
