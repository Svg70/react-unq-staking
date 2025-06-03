"use client"

import { useWallet } from "@/context/wallet-context"
import {formatNumber} from "@/utils/staking-api.ts";
import {toDecimalString} from "@/utils/toDecimalsString.ts";

interface BalanceInfoProps {
  activeTab?: "stake" | "unstake"
}

export default function BalanceInfo({ activeTab = "stake" }: BalanceInfoProps) {
  const { connected, walletAddress, tokenSymbol, isLoading, balanceData } = useWallet()

  if (!connected || !walletAddress) return null

  const isDataLoading = isLoading || !balanceData

  const total = isDataLoading
    ? "..."
    : balanceData?.totalBalance
    ? `${formatNumber(toDecimalString(balanceData.totalBalance.raw, balanceData.totalBalance.decimals))} ${tokenSymbol}`
    : `0 ${tokenSymbol}`

  const staked = isDataLoading
    ? "..."
    : balanceData?.stakedBalance
    ? `${formatNumber(toDecimalString(balanceData.stakedBalance.raw, balanceData.stakedBalance.decimals))} ${tokenSymbol}`
    : `0 ${tokenSymbol}`

  const pending = isDataLoading
    ? "..."
    : balanceData?.lockedBalance
    ? `${formatNumber(toDecimalString(balanceData.lockedBalance.raw, balanceData.lockedBalance.decimals))} ${tokenSymbol}`
    : `0 ${tokenSymbol}`

  const available = isDataLoading
    ? "..."
    : balanceData?.availableBalance
    ? `${formatNumber(toDecimalString(balanceData.availableBalance.raw, balanceData.availableBalance.decimals))} ${tokenSymbol}`
    : `0 ${tokenSymbol}`

  return (
    <div className="space-y-2">
      {activeTab === "stake" ? (
        <>
          <div className="flex justify-between text-base font-normal">
            <span className="text-gray-700 dark:text-gray-300">Total balance:</span>
            <span>{total}</span>
          </div>

          <div className="flex justify-between text-base font-normal">
            <span className="text-gray-700 dark:text-gray-300">Staked volume:</span>
            <span>{staked}</span>
          </div>
          <div className="flex justify-between text-base font-normal">
            <span className="text-gray-700 dark:text-gray-300">Pending unstake:</span>
            <span>{pending}</span>
          </div>
          <div className="flex justify-between text-base font-normal">
            <span className="text-gray-700 dark:text-gray-300">Available to stake:</span>
            <span>{available}</span>
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-between text-base font-normal">
            <span className="text-gray-600 dark:text-gray-300">Pending unstake:</span>
            <span className="font-medium">{pending}</span>
          </div>
          <div className="flex justify-between text-base font-normal">
            <span className="text-gray-600 dark:text-gray-300">Staked volume:</span>
            <span className="font-medium">{staked}</span>
          </div>
        </>
      )}
    </div>
  )
}
