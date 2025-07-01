"use client"

import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"

export default function Header() {
  const { resolvedTheme, setTheme } = useTheme()

  const toggleTheme = () => {
    const next = resolvedTheme === "dark" ? "light" : "dark"
    setTheme(next)
  }

  return (
      <header className={"sticky top-0 shadow-sm bg-white dark:bg-gray-900"}>
        <div className={"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"}>
          <div className={"flex justify-end h-16 items-center space-x-4"}>
            <button
                onClick={toggleTheme}
                className={"p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition"}
            >
              {resolvedTheme === "dark" ? (
                  <Sun className="w-5 h-5" />
              ) : (
                  <Moon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </header>
  )
}
