"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/context/wallet-context"
import StakingPage from "./staking-page"


export default function StakingPageClient() {
  const [isLoading, setIsLoading] = useState(true)
  const [isInitializing, setIsInitializing] = useState(true)
  const [isConnecting, setIsConnecting] = useState(false)

  // Initialize wallet context and states
  const walletContext = useWallet()

  useEffect(() => {
    if (walletContext) {
      setIsInitializing(walletContext.isInitializing)
      setIsConnecting(walletContext.isConnecting)
      setIsLoading(walletContext.isInitializing || walletContext.isConnecting)
    }
  }, [walletContext])

  // Show loader when either connecting or initializing
  const showLoader = isLoading

  return (
    <>
      <StakingPage />
      {showLoader && (
        <div className="st-fixed st-inset-0 st-bg-black/30 st-backdrop-blur-sm st-flex st-items-center st-justify-center st-z-50">
          <div className="st-bg-white dark:st-bg-gray-800 st-rounded-lg st-shadow-xl st-p-8 st-max-w-md st-w-full st-text-center">
            <div className="st-animate-spin st-rounded-full st-h-12 st-w-12 st-border-b-2 st-border-orange-500 st-mx-auto st-mb-4"></div>
            <h3 className="st-text-xl st-font-semibold st-mb-2 st-text-gray-900 dark:st-text-white">
              {isInitializing ? "Initializing Wallet" : "Connecting Wallet"}
            </h3>
            <p className="st-text-gray-600 dark:st-text-gray-300">
              {isInitializing
                ? "Please wait while we initialize your wallet connection..."
                : "Please wait while we connect to your wallet..."}
            </p>
          </div>
        </div>
      )}
    </>
  )
}
