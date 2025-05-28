import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex st-h-10 st-w-full st-rounded-md border st-border-input st-bg-background px-3 py-2 st-text-base st-ring-offset-background file:st-border-0 file:st-bg-transparent file:st-text-sm file:st-font-medium file:st-text-foreground placeholder:st-text-muted-foreground focus-st-visible:outline-none focus-st-visible:ring-2 focus-st-visible:ring-ring focus-st-visible:ring-offset-2 disabled:st-cursor-not-allowed disabled:st-opacity-50 md:st-text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
