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
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              {isInitializing ? "Initializing Wallet" : "Connecting Wallet"}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
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
