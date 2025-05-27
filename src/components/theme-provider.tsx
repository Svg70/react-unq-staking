"use client"

import { ReactNode, useEffect } from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const html = document.documentElement

    const sync = () => {
      console.log('SWITCH_THEMES_WORKS', html.classList)
      if (html.classList.contains("darkmode")) {
        html.classList.add("dark")
      } else {
        html.classList.remove("dark")
      }
    }

    sync()
    const mo = new MutationObserver(sync)
    mo.observe(html, { attributes: true, attributeFilter: ["class"] })
    return () => mo.disconnect()
  }, [])

  return (
    <NextThemesProvider attribute="class" defaultTheme="system">
      {children}
    </NextThemesProvider>
  )
}
