"use client"

import { useWallet } from "@/context/wallet-context"
import { toDecimalString } from "@/utils/toDecimalsString.ts"

interface BalanceInfoProps {
  activeTab?: "stake" | "unstake"
  decimalPlaces?: number
}

export default function BalanceInfo({
  activeTab = "stake",
  decimalPlaces = 4,
}: BalanceInfoProps) {
  const { connected, walletAddress, tokenSymbol, isLoading, balanceData } = useWallet()

  if (!connected || !walletAddress) return null

  const isDataLoading = isLoading || !balanceData

  const formatFixed = (raw: string, decimals: number): string => {
    const decimalStr = toDecimalString(raw, decimals)
    const value = parseFloat(decimalStr)
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    }).format(value)
  }

  const total = isDataLoading
    ? "..."
    : balanceData?.totalBalance
    ? `${formatFixed(balanceData.totalBalance.raw, balanceData.totalBalance.decimals)} ${tokenSymbol}`
    : `0.${"0".repeat(decimalPlaces)} ${tokenSymbol}`

  const staked = isDataLoading
    ? "..."
    : balanceData?.stakedBalance
    ? `${formatFixed(balanceData.stakedBalance.raw, balanceData.stakedBalance.decimals)} ${tokenSymbol}`
    : `0.${"0".repeat(decimalPlaces)} ${tokenSymbol}`


  const unstaked = isDataLoading
    ? "..."
    : balanceData?.unstakedBalance
    ? `${formatFixed(balanceData.unstakedBalance.raw, balanceData.unstakedBalance.decimals)} ${tokenSymbol}`
    : `0.${"0".repeat(decimalPlaces)} ${tokenSymbol}`

  const pending = isDataLoading
    ? "..."
    : balanceData?.lockedBalance
    ? `${formatFixed(balanceData.lockedBalance.raw, balanceData.lockedBalance.decimals)} ${tokenSymbol}`
    : `0.${"0".repeat(decimalPlaces)} ${tokenSymbol}`

  const available = isDataLoading
    ? "..."
    : balanceData?.availableBalance
    ? `${formatFixed(balanceData.availableBalance.raw, balanceData.availableBalance.decimals)} ${tokenSymbol}`
    : `0.${"0".repeat(decimalPlaces)} ${tokenSymbol}`

  return (
    <div className="space-y-2">
      {activeTab === "stake" ? (
        <>
          <div className="flex justify-between text-base font-normal">
            <span className="text-gray-700 dark:text-gray-300">Total balance:</span>
            <span className="tabular-nums">{total}</span>
          </div>
          <div className="flex justify-between text-base font-normal">
            <span className="text-gray-700 dark:text-gray-300">Staked volume:</span>
            <span className="tabular-nums">{staked}</span>
          </div>
          <div className="flex justify-between text-base font-normal">
            <span className="text-gray-700 dark:text-gray-300">Pending unstake:</span>
            <span className="tabular-nums">{pending}</span>
          </div>
          <div className="flex justify-between text-base font-normal">
            <span className="text-gray-700 dark:text-gray-300">Available to stake:</span>
            <span className="tabular-nums">{available}</span>
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-between text-base font-normal">
            <span className="text-gray-600 dark:text-gray-300">Pending unstake:</span>
            <span className="tabular-nums font-medium">{unstaked}</span>
          </div>
          <div className="flex justify-between text-base font-normal">
            <span className="text-gray-600 dark:text-gray-300">Staked volume:</span>
            <span className="tabular-nums font-medium">{staked}</span>
          </div>
        </>
      )}
    </div>
  )
}
