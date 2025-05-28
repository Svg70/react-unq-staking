"use client"

import React, { useState, useRef, useEffect } from "react"
import { cn } from "../lib/utils"

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

  useEffect(() => {
    if (isVisible && tooltipRef.current && triggerRef.current) {
      const trigger = triggerRef.current.getBoundingClientRect()
      const tooltip = tooltipRef.current

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

  const qtipIcon = (
    <svg className={cn("st-h-4 st-w-4")} viewBox="0 0 20 20" fill="currentColor">
      <defs>
        <symbol id="qtip" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
            clipRule="evenodd"
          />
        </symbol>
      </defs>
      <use href="#qtip" />
    </svg>
  )

  return (
      <div
          ref={triggerRef}
          className={cn("st-relative st-inline-block st-flex")}
          onMouseEnter={() => setIsVisible(true)}
          onMouseLeave={() => setIsVisible(false)}
          onFocus={() => setIsVisible(true)}
          onBlur={() => setIsVisible(false)}
      >
        {useQtipIcon ? (
            <button
                type="button"
                className={cn(
                    "st-ml-1",
                    "st-text-gray-400 st-hover:text-gray-600",
                    "dark:st-text-gray-500 dark:st-hover:text-gray-400",
                    "st-focus:outline-none"
                )}
            >
              {qtipIcon}
            </button>
        ) : (
            children
        )}
        {isVisible && (
            <div
                ref={tooltipRef}
                role="tooltip"
                className={cn(
                    "st-absolute",
                    "st-z-50",
                    "st-px-3 st-py-2",
                    "st-text-sm st-text-white",
                    "st-bg-gray-800 dark:st-bg-gray-700",
                    "st-rounded-md st-shadow-lg",
                    "st-whitespace-nowrap"
                )}
            >
              {text}
              <div
                  className={cn(
                      "st-absolute",
                      "st-w-2 st-h-2",
                      "st-bg-gray-800 dark:st-bg-gray-700",
                      "st-transform st-rotate-45",
                      position === "top"
                          ? "st-bottom-[-4px] st-left-1/2 -st-translate-x-1/2"
                          : position === "bottom"
                              ? "st-top-[-4px] st-left-1/2 -st-translate-x-1/2"
                              : position === "left"
                                  ? "st-right-[-4px] st-top-1/2 -st-translate-y-1/2"
                                  : "st-left-[-4px] st-top-1/2 -st-translate-y-1/2"
                  )}
              />
            </div>
        )}
      </div>
  )
}
