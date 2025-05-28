import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex st-min-h-[80px] st-w-full st-rounded-md border st-border-input st-bg-background px-3 py-2 st-text-base st-ring-offset-background placeholder:st-text-muted-foreground focus-st-visible:outline-none focus-st-visible:ring-2 focus-st-visible:ring-ring focus-st-visible:ring-offset-2 disabled:st-cursor-not-allowed disabled:st-opacity-50 md:st-text-sm",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
