"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/context/wallet-context"
import { useTab } from "@/context/tab-context"
import TokenSelector from "@/components/token-selector"
import WalletInfo from "@/components/wallet-info"
import CustomTooltip from "@/components/custom-tooltip"
import { toNano } from "@/lib/toNano"
import { cn } from "../lib/utils"

const ESTIMATE_FEE = 0.15
const MIN_STAKE_AMOUNT = 100;

interface StakingFormProps {
  onConnectWallet: () => void
  onStartStaking?: () => void
  onStakingSuccess?: (hash: string) => void
  onStakingError?: (error: string) => void
}

export default function StakingForm({
  onConnectWallet,
  onStartStaking,
  onStakingSuccess,
  onStakingError,
}: StakingFormProps) {
  const {
    connected,
    availableToStake,
    stakesLeft,
    isLoading,
    selectedAccount,
    stakeWithSDK,
    refreshBalances,
    refreshTransactionHistory,
    tokenSymbol,
    setTokenSymbol,
  } = useWallet()

  const { registerTabChangeCallback } = useTab()

  const [amount, setAmount] = useState("")
  const [isStaking, setIsStaking] = useState(false)
  const [isMaxAmount, setIsMaxAmount] = useState(false)
  const [isValidAmount, setIsValidAmount] = useState(false)
  const [validationMessage, setValidationMessage] = useState("")

  // Get max available amount
  const getMaxAmount = () => {
    const availableMatch = availableToStake.match(/[\d.]+/)
    return availableMatch ? availableMatch[0] : "0"
  }

  // Validate amount
  const validateAmount = (value: string) => {
    // If amount is empty, it's not valid but we don't show an error
    if (!value) {
      setIsValidAmount(false)
      setValidationMessage("")
      return
    }

    const maxAmount = getMaxAmount()
    const maxAmountNum = Number.parseFloat(maxAmount)



       const maxNet = Math.max(maxAmountNum - ESTIMATE_FEE, 0)

    const maxNetStr = maxNet.toFixed(4)

    const amountNum = Number.parseFloat(value)

    if (isNaN(amountNum)) {
      setIsValidAmount(false)
      setValidationMessage("Please enter a valid number")
      return
    }

    if (amountNum < MIN_STAKE_AMOUNT) {
      setIsValidAmount(false)
      setValidationMessage(`Minimum staking amount is 100 ${tokenSymbol}`)
      return
    }

    if (amountNum > maxNet) {
      setIsValidAmount(false)
      setValidationMessage(
        `Amount must not exceed available balance minus fee (${maxNetStr} ${tokenSymbol})`
      )
      return
    }

    setIsValidAmount(true)
    setValidationMessage("")
    setIsMaxAmount(value === maxNetStr)
  }

  useEffect(() => {
    validateAmount(amount)
  }, [amount, availableToStake, tokenSymbol])

  useEffect(() => {
    const resetForm = () => {
      setAmount("")
      setIsValidAmount(true)
      setValidationMessage("")
      setIsMaxAmount(false)
    }

    // Register the callback for the stake tab
    const unregister = registerTabChangeCallback("stake", resetForm)

    // Clean up on unmount
    return unregister
  }, [registerTabChangeCallback])

  const handleStake = async () => {
    if (!connected || !isValidAmount) return

    setIsStaking(true)
    onStartStaking?.()

    try {
      const amountInNano = toNano(amount, 18)
      const hash = await stakeWithSDK(amountInNano)
      // Refresh balances and transaction history
      await refreshBalances()
      await refreshTransactionHistory()

      onStakingSuccess?.(hash)
    } catch (error) {
      console.error("Staking failed:", error)
      onStakingError?.((error as Error).message || "Transaction failed. Please try again.")
    } finally {
      setIsStaking(false)
      setAmount('')
    }
  }

  const handleMaxAmount = () => {
    const max = parseFloat(getMaxAmount())
    const net = Math.max(max - ESTIMATE_FEE, 0)
    const str = net.toFixed(4)
    setAmount(str)
    validateAmount(str)
    setIsMaxAmount(true)
  }

  return (
      <div className={cn("st-flex st-flex-col st-space-y-6")}>
        <div>
          <label className={cn("st-block st-text-sm st-font-medium st-text-gray-700 dark:st-text-gray-300 st-mb-2")}>Token</label>
          <TokenSelector selectedToken={tokenSymbol} onSelectToken={setTokenSymbol} />
        </div>

        {connected ? (
            <WalletInfo activeTab="stake" />
        ) : (
            <div className={cn("st-flex st-justify-center st-mt-4")}>
              <button
                  onClick={onConnectWallet}
                  className={cn(
                      "st-w-full st-px-6 st-py-3 st-font-medium st-rounded-md st-transition-colors st-bg-blue-500 st-text-white st-hover:bg-blue-600 dark:st-bg-blue-600 dark:st-hover:bg-blue-700"
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
                      placeholder={`Enter amount to stake (min ${MIN_STAKE_AMOUNT} ${tokenSymbol})`}
                      className={cn(
                          "st-w-full st-px-4 st-py-3 st-border st-rounded-md st-focus:outline-none st-focus:ring-2",
                          !amount || isValidAmount
                              ? "st-border-gray-300 dark:st-border-gray-600 st-focus:ring-blue-500 st-focus:border-blue-500 dark:st-bg-gray-800 dark:st-text-gray-100"
                              : "st-border-red-500 st-focus:ring-red-500 st-focus:border-red-500 st-bg-red-50 dark:st-bg-red-900/20 dark:st-border-red-500"
                      )}
                      disabled={isLoading || isStaking}
                  />
                  <button
                      type="button"
                      onClick={handleMaxAmount}
                      className={cn(
                          "st-absolute st-right-2 st-top-1/2 st-transform -st-translate-y-1/2 st-px-3 st-py-1 st-text-sm st-rounded st-hover:bg-blue-50 dark:st-hover:bg-gray-600",
                          isMaxAmount
                              ? "st-bg-blue-100 st-text-blue-700 dark:st-bg-blue-900 dark:st-text-blue-300"
                              : "st-bg-white st-text-blue-500 dark:st-bg-gray-700 dark:st-text-blue-300"
                      )}
                      disabled={isLoading || isStaking}
                  >
                    Max
                  </button>
                </div>
                {validationMessage && (
                    <p className={cn("st-text-sm st-text-red-500 dark:st-text-red-400 st-mt-1")}>{validationMessage}</p>
                )}
                <p className={cn("st-text-sm st-text-gray-500 dark:st-text-gray-400 st-mt-1")}>
                  You can deposit any amount from a minimum of 100 tokens up to 10 times
                </p>
              </div>

              <div className={cn("st-space-y-2 st-mt-4")}>
                <div className={cn("st-flex st-justify-between st-items-center")}>
                  <div className={cn("st-flex st-items-center")}>
                    <span className={cn("st-text-gray-700 dark:st-text-gray-300")}>Annual percentage yield</span>
                    <CustomTooltip text="The annual rate of return on investment" useQtipIcon={true} />
                  </div>
                  <span className={cn("st-font-medium dark:st-text-gray-200")}>18%</span>
                </div>

                <div className={cn("st-flex st-justify-between st-items-center")}>
                  <span className={cn("st-text-gray-700 dark:st-text-gray-300")}>Transaction cost</span>
                  <span className={cn("st-font-medium dark:st-text-gray-200")}>≈0.1 {tokenSymbol}</span>
                </div>

                <div className={cn("st-flex st-justify-between st-items-center")}>
                  <div className={cn("st-flex st-items-center")}>
                    <span className={cn("st-text-gray-700 dark:st-text-gray-300")}>Stakes left</span>
                    <CustomTooltip text="You can create up to 10 stakes from one wallet" useQtipIcon={true} />
                  </div>
                  <span className={cn("st-font-medium dark:st-text-gray-200")}>{stakesLeft}</span>
                </div>
              </div>

              <button
                  onClick={handleStake}
                  disabled={isStaking || isLoading || !isValidAmount}
                  className={cn(
                      "st-w-full st-px-6 st-py-4 st-font-medium st-rounded-md st-transition-colors",
                      isStaking || isLoading || !isValidAmount
                          ? "st-bg-gray-300 st-text-gray-500 dark:st-bg-gray-700 dark:st-text-gray-400 st-cursor-not-allowed"
                          : isMaxAmount
                              ? "st-bg-green-500 st-text-white st-hover:bg-green-600 dark:st-bg-green-600 dark:st-hover:bg-green-700"
                              : "st-bg-blue-500 st-text-white st-hover:bg-blue-600 dark:st-bg-blue-600 dark:st-hover:bg-blue-700"
                  )}
              >
                {isStaking ? "Staking..." : isMaxAmount ? "Stake All" : "Stake"}
              </button>
            </>
        )}
      </div>
  )
}
