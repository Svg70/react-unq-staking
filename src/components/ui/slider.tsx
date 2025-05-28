"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex st-w-full touch-none st-select-none st-items-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative st-h-2 st-w-full grow st-overflow-hidden st-rounded-full st-bg-secondary">
      <SliderPrimitive.Range className="absolute st-h-full st-bg-primary" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block st-h-5 st-w-5 st-rounded-full st-border-2 st-border-primary st-bg-background st-ring-offset-background st-transition-colors focus-st-visible:outline-none focus-st-visible:ring-2 focus-st-visible:ring-ring focus-st-visible:ring-offset-2 disabled:st-pointer-events-none disabled:st-opacity-50" />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
