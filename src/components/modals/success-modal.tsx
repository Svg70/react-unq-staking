"use client"

import { useEffect, useState } from "react"
import { useWallet } from "@/context/wallet-context"
import { cn } from "../../lib/utils"

interface SuccessModalProps {
  transactionHash: string
  onClose: () => void
  isUnstaking: boolean
}

export default function SuccessModal({ transactionHash, onClose, isUnstaking }: SuccessModalProps) {
  const [isVisible, setIsVisible] = useState(false)
  const { tokenSymbol, getSubscanUrl } = useWallet()

  const hash = typeof transactionHash === "string" ? transactionHash : ""

  const subscanUrl = hash ? getSubscanUrl(hash) : ""

  useEffect(() => {
    setIsVisible(true)
    return () => setIsVisible(false)
  }, [])

  if (!isVisible) return null

  return (
      <div
          className={cn("st-fixed st-inset-0 st-bg-black/30 st-backdrop-blur-sm st-flex st-items-center st-justify-center st-z-50")}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose()
          }}
      >
        <div className={cn("st-bg-white dark:st-bg-gray-800 st-rounded-lg st-shadow-xl st-p-6 st-max-w-md st-w-full")}>
          <div className={cn("st-text-center")}>
            <div
                className={cn(
                    "st-mx-auto st-flex st-items-center st-justify-center st-h-16 st-w-16 st-rounded-full st-bg-green-100 dark:st-bg-green-900 st-mb-4"
                )}
            >
              <svg
                  className={cn("st-h-10 st-w-10 st-text-green-500 dark:st-text-green-300")}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className={cn("st-text-xl st-font-semibold st-mb-2 st-text-gray-900 dark:st-text-white")}>Success!</h3>
            <p className={cn("st-text-gray-600 dark:st-text-gray-300 st-mb-4")}>
              {isUnstaking
                  ? `In a week this sum becomes completely free for further use`
                  : `You successfully staked`}
            </p>

            {hash && (
                <div className={cn("st-mb-4 st-p-3 st-bg-gray-100 dark:st-bg-gray-700 st-rounded-md")}>
                  <p className={cn("st-text-sm st-text-gray-700 dark:st-text-gray-300 st-font-mono st-break-all")}>{hash}</p>
                </div>
            )}

            {subscanUrl && (
                <div className={cn("st-mb-4")}>
                  <a
                      href={subscanUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                          "st-text-orange-500 st-hover:text-orange-600 dark:st-text-orange-400 dark:st-hover:text-orange-300",
                          "st-font-medium st-flex st-items-center st-justify-center"
                      )}
                  >
                    <span>View on Subscan</span>
                    <svg
                        className={cn("st-w-4 st-h-4 st-ml-1")}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </div>
            )}

            <button
                onClick={onClose}
                className={cn(
                    "st-w-full st-py-2 st-px-4 st-bg-orange-500 st-hover:bg-orange-600 st-text-white st-font-medium st-rounded-md",
                    "st-focus:outline-none st-focus:ring-2 st-focus:ring-offset-2 st-focus:ring-orange-500 st-transition-colors"
                )}
            >
              Close
            </button>
          </div>
        </div>
      </div>
  )
}
