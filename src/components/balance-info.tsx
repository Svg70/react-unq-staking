"use client"

import { useMemo } from "react"
import { useWallet } from "@/context/wallet-context"

interface BalanceInfoProps {
  activeTab?: "stake" | "unstake"
}

export default function BalanceInfo({ activeTab = "stake" }: BalanceInfoProps) {
  const { connected, walletAddress, tokenSymbol, isLoading, balanceData } = useWallet()

  if (!connected || !walletAddress) return null

  const isDataLoading = isLoading || !balanceData

const formatNumber = (raw: string, decimals: number = 18): string => {
  const DISPLAY_DECIMALS = 4;
  const value = BigInt(raw);

  if (value === 0n) {
    return "0";
  }

  let divisor = 1n;
  for (let i = 0; i < decimals; i++) {
    divisor *= 10n;
  }

  const whole = value / divisor;
  const fraction = value % divisor;

  const fullFractionStr = fraction.toString().padStart(decimals, "0");
  const fracStrDisplay = fullFractionStr.substring(0, DISPLAY_DECIMALS);

  if (whole === 0n && fracStrDisplay.split('').every(digit => digit === '0')) {
    return "0";
  }

  return `${whole.toString()}.${fracStrDisplay}`;
};


  const total = isDataLoading
    ? "..."
    : balanceData?.totalBalance
    ? `${formatNumber(balanceData.totalBalance.raw, balanceData.totalBalance.decimals)} ${tokenSymbol}`
    : `0 ${tokenSymbol}`

  const staked = isDataLoading
    ? "..."
    : balanceData?.stakedBalance
    ? `${formatNumber(balanceData.stakedBalance.raw, balanceData.stakedBalance.decimals)} ${tokenSymbol}`
    : `0 ${tokenSymbol}`

  const pending = isDataLoading
    ? "..."
    : balanceData?.lockedBalance
    ? `${formatNumber(balanceData.lockedBalance.raw, balanceData.lockedBalance.decimals)} ${tokenSymbol}`
    : `0 ${tokenSymbol}`

  const available = isDataLoading
    ? "..."
    : balanceData?.availableBalance
    ? `${formatNumber(balanceData.availableBalance.raw, balanceData.availableBalance.decimals)} ${tokenSymbol}`
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
