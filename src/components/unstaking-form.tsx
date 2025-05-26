"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/context/wallet-context"
import { useTab } from "@/context/tab-context"
import TokenSelector from "@/components/token-selector"
import WalletInfo from "@/components/wallet-info"
import { toNano } from "@/lib/toNano"
import { cn } from "../lib/utils"

interface UnstakingFormProps {
  onConnectWallet: () => void
  onStartUnstaking?: () => void
  onUnstakingSuccess?: (hash: string) => void
  onUnstakingError?: (error: string) => void
}

export default function UnstakingForm({
  onConnectWallet,
  onStartUnstaking,
  onUnstakingSuccess,
  onUnstakingError,
}: UnstakingFormProps) {
  const {
    connected,
    stakedBalance,
    isLoading,
    unstakeWithSDK,
    refreshBalances,
    refreshTransactionHistory,
    tokenSymbol,
    setTokenSymbol,
  } = useWallet()

  const { registerTabChangeCallback } = useTab()

  const [amount, setAmount] = useState("")
  const [isUnstaking, setIsUnstaking] = useState(false)
  const [isMaxAmount, setIsMaxAmount] = useState(false)
  const [isValidAmount, setIsValidAmount] = useState(true)
  const [validationMessage, setValidationMessage] = useState("")

  // Get max staked amount
  const getMaxAmount = () => {
    const stakedMatch = stakedBalance.match(/[\d.]+/)
    return stakedMatch ? stakedMatch[0] : "0"
  }

  // Validate amount
  const validateAmount = (value: string) => {
    if (!value || value.trim() === "") {
      setIsValidAmount(true)
      setValidationMessage("")
      return
    }

    const maxAmount = getMaxAmount()
    const maxAmountNum = Number.parseFloat(maxAmount)
    const amountNum = Number.parseFloat(value)

    if (isNaN(amountNum)) {
      setIsValidAmount(false)
      setValidationMessage("Please enter a valid number")
      return
    }

    if (amountNum <= 0) {
      setIsValidAmount(false)
      setValidationMessage("Amount must be greater than 0")
      return
    }

    if (amountNum > maxAmountNum) {
      setIsValidAmount(false)
      setValidationMessage(`Amount exceeds staked balance (${maxAmount} ${tokenSymbol})`)
      return
    }

    setIsValidAmount(true)
    setValidationMessage("")
    setIsMaxAmount(value === maxAmount)
  }

  useEffect(() => {
    validateAmount(amount)
  }, [amount, stakedBalance, tokenSymbol])

  // Reset form when tab changes
  useEffect(() => {
    const resetForm = () => {
      setAmount("")
      setIsValidAmount(true)
      setValidationMessage("")
      setIsMaxAmount(false)
    }

    // Register the callback for the unstake tab
    const unregister = registerTabChangeCallback("unstake", resetForm)
    
    // Clean up on unmount
    return unregister
  }, [registerTabChangeCallback])

  const handleUnstake = async () => {
    if (!connected || !isValidAmount) return

    setIsUnstaking(true)
    onStartUnstaking?.()

    try {
      let hash

      // If max amount is selected, use unstakeAll
      if (isMaxAmount) {
        console.log("Using unstakeAll since max amount is selected")
        hash = await unstakeWithSDK("", true) // Empty string with isAll=true for unstakeAll
      } else {
        const amountInNano = toNano(amount, 18)
        hash = await unstakeWithSDK(amountInNano)
      }

      await refreshBalances()
      await refreshTransactionHistory()

      onUnstakingSuccess?.(hash)
    } catch (error) {
      console.error("Unstaking failed:", error)
      onUnstakingError?.((error as Error).message || "Transaction failed. Please try again.")
    } finally {
      setIsUnstaking(false)
    }
  }

  const handleMaxAmount = () => {
    const maxAmount = getMaxAmount()
    setAmount(maxAmount)

    validateAmount(maxAmount)

    setIsMaxAmount(true)
  }

  const hasStakedTokens = () => {
    const stakedMatch = stakedBalance.match(/[\d.]+/)
    return stakedMatch && Number.parseFloat(stakedMatch[0]) > 0
  }

  return (
    <div className={cn("flex flex-col space-y-6")}>
      <div>
        <label className={cn("block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2")}>Token</label>
        <TokenSelector selectedToken={tokenSymbol} onSelectToken={setTokenSymbol} />
      </div>

      {connected ? (
        <WalletInfo activeTab="unstake" />
      ) : (
        <div className={cn("flex justify-center")}>
          <button
            onClick={onConnectWallet}
            className={cn(
              "w-full px-6 py-3 font-medium rounded-md transition-colors",
              "bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
            )}
          >
            Connect Wallet
          </button>
        </div>
      )}

      {connected && (
        <>
          <div>
            <label className={cn("block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2")}>
              Amount
            </label>
            <div className={cn("relative")}>
              <input
                type="text"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value)
                  setIsMaxAmount(e.target.value === getMaxAmount())
                }}
                placeholder={`Enter amount to unstake`}
                className={cn(
                  "w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2",
                  !amount || isValidAmount
                    ? "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100"
                    : "border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-500"
                )}
                disabled={isLoading || isUnstaking}
              />
              <button
                type="button"
                onClick={handleMaxAmount}
                className={cn(
                  "absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 text-sm rounded hover:bg-blue-50 dark:hover:bg-gray-600",
                  isMaxAmount
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                    : "bg-white text-blue-500 dark:bg-gray-700 dark:text-blue-300"
                )}
                disabled={isLoading || isUnstaking}
              >
                Max
              </button>
            </div>
            {amount && !isValidAmount && (
              <p className={cn("text-sm text-red-500 dark:text-red-400 mt-1")}>{validationMessage}</p>
            )}
          </div>

          <div className={cn("flex justify-between items-center")}>  
            <span className={cn("text-gray-700 dark:text-gray-300")}>Transaction cost</span>
            <span className={cn("font-medium dark:text-gray-200")}>≈0.1 {tokenSymbol}</span>
          </div>

          {!hasStakedTokens() && (
            <p className={cn("text-sm text-red-500 dark:text-red-400")}>
              You do not have funds in the deposit. Please go to the tab "Stake".
            </p>
          )}

          <button
            onClick={handleUnstake}
            disabled={isUnstaking || isLoading || !isValidAmount || !amount || !hasStakedTokens()}
            className={cn(
              "w-full px-6 py-4 font-medium rounded-md transition-colors",
              isUnstaking || isLoading || !isValidAmount || !amount || !hasStakedTokens()
                ? "bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
            )}
          >
            {isUnstaking ? "Unstaking..." : isMaxAmount ? "Unstake All" : "Unstake"}
          </button>

          <p className={cn("text-sm text-gray-500 dark:text-gray-400 italic")}>
            You can withdraw the entire amount at any time. The funds will be credited to the account in a week.
          </p>
        </>
      )}
    </div>
  )
}
