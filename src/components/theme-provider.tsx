"use client"

import { useEffect, ReactNode } from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import type { ThemeProviderProps } from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps & { children: ReactNode }) {
  useEffect(() => {
    const html = document.documentElement
    const root = document.getElementById('root')

    const sync = () => {
      if (!root) return
      html.classList.contains('darkmode')
        ? root.classList.add('dark')
        : root.classList.remove('dark')
    }

    sync()

    const mo = new MutationObserver(sync)
    mo.observe(html, { attributes: true, attributeFilter: ['class'] })

    return () => mo.disconnect()
  }, [])

  return (
    <NextThemesProvider {...props}>
      {children}
    </NextThemesProvider>
  )
}
