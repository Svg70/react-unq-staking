"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:st-bg-background group-[.toaster]:st-text-foreground group-[.toaster]:st-border-border group-[.toaster]:st-shadow-lg",
          description: "group-[.toast]:st-text-muted-foreground",
          actionButton:
            "group-[.toast]:st-bg-primary group-[.toast]:st-text-primary-foreground",
          cancelButton:
            "group-[.toast]:st-bg-muted group-[.toast]:st-text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
