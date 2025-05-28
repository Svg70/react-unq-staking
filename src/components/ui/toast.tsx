"use client"

import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed st-top-0 z-[100] flex st-max-h-screen st-w-full st-flex-col-reverse st-p-4 sm:st-bottom-0 sm:st-right-0 sm:st-top-auto sm:st-flex-col md:st-max-w-[420px]",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group st-pointer-events-auto relative flex st-w-full st-items-center st-justify-between st-space-x-4 st-overflow-hidden st-rounded-md border st-p-6 pr-8 st-shadow-lg st-transition-all data-[swipe=cancel]:st-translate-x-0 data-[swipe=end]:st-translate-x-[var(--radix-toast-swipe-st-end-x)] data-[swipe=move]:st-translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:st-transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-st-right-full data-[state=open]:slide-in-from-st-top-full data-[state=open]:sm:slide-in-from-st-bottom-full",
  {
    variants: {
      variant: {
        default: "border st-bg-background st-text-foreground",
        destructive:
          "destructive group st-border-destructive st-bg-destructive st-text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex st-h-8 shrink-0 st-items-center st-justify-center st-rounded-md border st-bg-transparent px-3 st-text-sm st-font-medium st-ring-offset-background st-transition-colors st-hover:bg-secondary st-focus:outline-none st-focus:ring-2 st-focus:ring-ring st-focus:ring-offset-2 disabled:st-pointer-events-none disabled:st-opacity-50 group-[.destructive]:st-border-muted/40 group-[.destructive]:st-hover:border-destructive/30 group-[.destructive]:st-hover:bg-destructive group-[.destructive]:st-hover:text-destructive-foreground group-[.destructive]:st-focus:ring-destructive",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute st-right-2 st-top-2 st-rounded-md st-p-1 st-text-foreground/50 st-opacity-0 st-transition-opacity st-hover:text-foreground st-focus:opacity-100 st-focus:outline-none st-focus:ring-2 st-group-hover:opacity-100 group-[.destructive]:st-text-red-300 group-[.destructive]:st-hover:text-red-50 group-[.destructive]:st-focus:ring-red-400 group-[.destructive]:st-focus:ring-offset-red-600",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="st-h-4 st-w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("st-text-sm st-font-semibold", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("st-text-sm st-opacity-90", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}
