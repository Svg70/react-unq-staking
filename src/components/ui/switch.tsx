"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex st-h-6 st-w-11 shrink-0 st-cursor-pointer st-items-center st-rounded-full st-border-2 st-border-transparent st-transition-colors focus-st-visible:outline-none focus-st-visible:ring-2 focus-st-visible:ring-ring focus-st-visible:ring-offset-2 focus-st-visible:ring-offset-background disabled:st-cursor-not-allowed disabled:st-opacity-50 data-[state=checked]:st-bg-primary data-[state=unchecked]:st-bg-input",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "st-pointer-events-none block st-h-5 st-w-5 st-rounded-full st-bg-background st-shadow-lg st-ring-0 st-transition-transform data-[state=checked]:st-translate-x-5 data-[state=unchecked]:st-translate-x-0"
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
