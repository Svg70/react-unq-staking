"use client"

import { useEffect, useState } from "react"
import { useWallet } from "@/context/wallet-context"

interface SuccessModalProps {
  transactionHash: string
  blockNumber?: string
  onClose: () => void
  isUnstaking: boolean
}

export default function SuccessModal({ transactionHash, blockNumber, onClose, isUnstaking }: SuccessModalProps) {
  const [isVisible, setIsVisible] = useState(false)
  const { tokenSymbol, getSubscanUrl } = useWallet()

  const hash = typeof transactionHash === "string" ? transactionHash : ""

  const subscanUrl = hash ? getSubscanUrl(hash, blockNumber) : ""

  useEffect(() => {
    setIsVisible(true)
    return () => setIsVisible(false)
  }, [])

  if (!isVisible) return null

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 mb-4">
            <svg
              className="h-10 w-10 text-green-500 dark:text-green-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Success!</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {isUnstaking
              ? `In a week this sum becomes completely free for further use`
              : `You successfully staked`}
          </p>

          {hash && (
            <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
              <p className="text-sm text-gray-700 dark:text-gray-300 font-mono break-all">{hash}</p>
            </div>
          )}

          {subscanUrl && (
            <div className="mb-4">
              <a
                href={subscanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 font-medium flex items-center justify-center fill-none"
              >
                <span>{subscanUrl.includes('polkadot.js') ? 'View on Polkadot js' : 'View on Subscan'}</span>
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill="none"
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
            className="w-full py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
