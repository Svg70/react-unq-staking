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
      <div className={cn("st-flex st-flex-col st-space-y-6")}>
        <div>
          <label className={cn("st-block st-text-sm st-font-medium st-text-gray-700 dark:st-text-gray-300 st-mb-2")}>Token</label>
          <TokenSelector selectedToken={tokenSymbol} onSelectToken={setTokenSymbol} />
        </div>

        {connected ? (
            <WalletInfo activeTab="unstake" />
        ) : (
            <div className={cn("st-flex st-justify-center")}>
              <button
                  onClick={onConnectWallet}
                  className={cn(
                      "st-w-full st-px-6 st-py-3 st-font-medium st-rounded-md st-transition-colors",
                      "st-bg-blue-500 st-text-white st-hover:bg-blue-600 dark:st-bg-blue-600 dark:st-hover:bg-blue-700"
                  )}
              >
                Connect Wallet
              </button>
            </div>
        )}

        {connected && (
            <>
              <div>
                <label className={cn("st-block st-text-sm st-font-medium st-text-gray-700 dark:st-text-gray-300 st-mb-2")}>
                  Amount
                </label>
                <div className={cn("st-relative")}>
                  <input
                      type="text"
                      value={amount}
                      onChange={(e) => {
                        setAmount(e.target.value)
                        setIsMaxAmount(e.target.value === getMaxAmount())
                      }}
                      placeholder={`Enter amount to unstake`}
                      className={cn(
                          "st-w-full st-px-4 st-py-3 st-border st-rounded-md st-focus:st-outline-none st-focus:st-ring-2",
                          !amount || isValidAmount
                              ? "st-border-gray-300 dark:st-border-gray-600 st-focus:st-ring-blue-500 st-focus:st-border-blue-500 dark:st-bg-gray-800 dark:st-text-gray-100"
                              : "st-border-red-500 st-focus:st-ring-red-500 st-focus:st-border-red-500 st-bg-red-50 dark:st-bg-red-900/20 dark:st-border-red-500"
                      )}
                      disabled={isLoading || isUnstaking}
                  />
                  <button
                      type="button"
                      onClick={handleMaxAmount}
                      className={cn(
                          "st-absolute st-right-2 st-top-1/2 st-transform -st-translate-y-1/2 st-px-3 st-py-1 st-text-sm st-rounded st-hover:st-bg-blue-50 dark:st-hover:st-bg-gray-600",
                          isMaxAmount
                              ? "st-bg-blue-100 st-text-blue-700 dark:st-bg-blue-900 dark:st-text-blue-300"
                              : "st-bg-white st-text-blue-500 dark:st-bg-gray-700 dark:st-text-blue-300"
                      )}
                      disabled={isLoading || isUnstaking}
                  >
                    Max
                  </button>
                </div>
                {amount && !isValidAmount && (
                    <p className={cn("st-text-sm st-text-red-500 dark:st-text-red-400 st-mt-1")}>{validationMessage}</p>
                )}
              </div>

              <div className={cn("st-flex st-justify-between st-items-center")}>
                <span className={cn("st-text-gray-700 dark:st-text-gray-300")}>Transaction cost</span>
                <span className={cn("st-font-medium dark:st-text-gray-200")}>≈0.1 {tokenSymbol}</span>
              </div>

              {!hasStakedTokens() && (
                  <p className={cn("st-text-sm st-text-red-500 dark:st-text-red-400")}>
                    You do not have funds in the deposit. Please go to the tab "Stake".
                  </p>
              )}

              <button
                  onClick={handleUnstake}
                  disabled={isUnstaking || isLoading || !isValidAmount || !amount || !hasStakedTokens()}
                  className={cn(
                      "st-w-full st-px-6 st-py-4 st-font-medium st-rounded-md st-transition-colors",
                      isUnstaking || isLoading || !isValidAmount || !amount || !hasStakedTokens()
                          ? "st-bg-gray-300 st-text-gray-500 dark:st-bg-gray-700 dark:st-text-gray-400 st-cursor-not-allowed"
                          : "st-bg-blue-500 st-text-white st-hover:st-bg-blue-600 dark:st-bg-blue-600 dark:st-hover:st-bg-blue-700"
                  )}
              >
                {isUnstaking ? "Unstaking..." : isMaxAmount ? "Unstake All" : "Unstake"}
              </button>

              <p className={cn("st-text-sm st-text-gray-500 dark:st-text-gray-400 st-italic")}>
                You can withdraw the entire amount at any time. The funds will be credited to the account in a week.
              </p>
            </>
        )}
      </div>
  )
}
