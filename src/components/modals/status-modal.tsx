"use client"

import { cn } from "../../lib/utils"

interface StatusModalProps {
  errorMessage: string
  onClose: () => void
}

export default function StatusModal({ errorMessage, onClose }: StatusModalProps) {
  return (
      <div className={cn("st-fixed st-inset-0 st-bg-black/30 st-backdrop-blur-sm st-flex st-items-center st-justify-center st-z-50")}>
        <div className={cn("st-bg-white dark:st-bg-gray-800 st-rounded-lg st-p-8 st-max-w-md st-w-full st-text-center st-relative")}>
          <div className={cn("st-text-red-500 st-mb-4")}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className={cn("st-h-12 st-w-12 st-mx-auto")}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
              <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className={cn("st-text-xl st-font-bold st-mb-2")}>Something went wrong</h3>
          <p className={cn("st-text-gray-600 dark:st-text-gray-400")}>
            {errorMessage || "Please reinitiate your last action"}
          </p>
          <button
              onClick={onClose}
              className={cn(
                  "st-absolute st-top-4 st-right-4 st-text-gray-500 st-hover:text-gray-700",
                  "dark:st-text-gray-400 dark:st-hover:text-gray-200"
              )}
          >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className={cn("st-h-6 st-w-6")}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
  )
}
