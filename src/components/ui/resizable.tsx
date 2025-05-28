"use client"

import { GripVertical } from "lucide-react"
import * as ResizablePrimitive from "react-resizable-panels"

import { cn } from "@/lib/utils"

const ResizablePanelGroup = ({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) => (
  <ResizablePrimitive.PanelGroup
    className={cn(
      "flex st-h-full st-w-full data-[panel-group-direction=vertical]:st-flex-col",
      className
    )}
    {...props}
  />
)

const ResizablePanel = ResizablePrimitive.Panel

const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean
}) => (
  <ResizablePrimitive.PanelResizeHandle
    className={cn(
      "relative flex st-w-px st-items-center st-justify-center st-bg-border after:absolute after:st-inset-y-0 after:st-left-1/2 after:st-w-1 after:-st-translate-x-1/2 focus-st-visible:outline-none focus-st-visible:ring-1 focus-st-visible:ring-ring focus-st-visible:ring-offset-1 data-[panel-group-direction=vertical]:st-h-px data-[panel-group-direction=vertical]:st-w-full data-[panel-group-direction=vertical]:after:st-left-0 data-[panel-group-direction=vertical]:after:st-h-1 data-[panel-group-direction=vertical]:after:st-w-full data-[panel-group-direction=vertical]:after:-st-translate-y-1/2 data-[panel-group-direction=vertical]:after:st-translate-x-0 [&[data-panel-group-direction=vertical]>div]:st-rotate-90",
      className
    )}
    {...props}
  >
    {withHandle && (
      <div className="st-z-10 flex st-h-4 st-w-3 st-items-center st-justify-center st-rounded-sm border st-bg-border">
        <GripVertical className="st-h-2.5 st-w-2.5" />
      </div>
    )}
  </ResizablePrimitive.PanelResizeHandle>
)

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
