"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"

interface CustomTooltipProps {
  text: string
  children?: React.ReactNode
  position?: "top" | "bottom" | "left" | "right"
  useQtipIcon?: boolean
}

export default function CustomTooltip({ text, children, position = "top", useQtipIcon = false }: CustomTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)

  // Position the tooltip based on the trigger element
  useEffect(() => {
    if (isVisible && tooltipRef.current && triggerRef.current) {
      const trigger = triggerRef.current.getBoundingClientRect()
      const tooltip = tooltipRef.current

      // Default positioning
      let top = 0
      let left = 0

      switch (position) {
        case "top":
          top = -tooltip.offsetHeight - 8
          left = (trigger.width - tooltip.offsetWidth) / 2
          break
        case "bottom":
          top = trigger.height + 8
          left = (trigger.width - tooltip.offsetWidth) / 2
          break
        case "left":
          top = (trigger.height - tooltip.offsetHeight) / 2
          left = -tooltip.offsetWidth - 8
          break
        case "right":
          top = (trigger.height - tooltip.offsetHeight) / 2
          left = trigger.width + 8
          break
      }

      tooltip.style.top = `${top}px`
      tooltip.style.left = `${left}px`
    }
  }, [isVisible, position])

  // Define the SVG for qtip icon
  const qtipIcon = (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
      <defs>
        <symbol id="qtip" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
            clipRule="evenodd"
          />
        </symbol>
      </defs>
      <use href="#qtip"></use>
    </svg>
  )

  return (
    <div
      className="relative inline-block flex"
      ref={triggerRef}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {useQtipIcon ? (
        <button
          className="ml-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400 focus:outline-none"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <use href="#qtip"></use>
          </svg>
        </button>
      ) : (
        children
      )}
      {isVisible && (
        <div
          ref={tooltipRef}
          className="absolute z-50 px-3 py-2 text-sm text-white bg-gray-800 dark:bg-gray-700 rounded-md shadow-lg whitespace-nowrap"
          role="tooltip"
        >
          {text}
          <div
            className={`absolute w-2 h-2 bg-gray-800 dark:bg-gray-700 transform rotate-45 ${
              position === "top"
                ? "bottom-[-4px] left-1/2 -translate-x-1/2"
                : position === "bottom"
                  ? "top-[-4px] left-1/2 -translate-x-1/2"
                  : position === "left"
                    ? "right-[-4px] top-1/2 -translate-y-1/2"
                    : "left-[-4px] top-1/2 -translate-y-1/2"
            }`}
          />
        </div>
      )}
    </div>
  )
}
