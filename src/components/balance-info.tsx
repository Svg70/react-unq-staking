"use client"

import {type BalanceDataItem, useWallet} from '@/context/wallet-context'
import CustomTooltip from '@/components/custom-tooltip.tsx';

interface BalanceInfoProps {
  activeTab?: "stake" | "unstake"
}

type BalanceSpanProps = {
  className?: string
  value?: Partial<Pick<BalanceDataItem, "raw" | "decimals" | "unit">>
  isLoading?: boolean
  displayDecimals?: number
}

export const BalanceSpan = (props: BalanceSpanProps) => {
  const {
    className = "font-medium",
    value,
    isLoading = false,
    displayDecimals = 4,
  } = props

  const decimals = value?.decimals ?? 18
  const unit = value?.unit ?? ""

  if (isLoading) return <span className={className}>...</span>

  const raw = BigInt(value?.raw ?? 0)
  if (raw === 0n) return <span className={className}>0</span>

  const divisor = 10n ** BigInt(decimals)
  const whole = raw / divisor
  const fraction = raw % divisor
  const padded = fraction.toString().padStart(decimals, "0")
  const displayFraction = padded.slice(0, displayDecimals)

  const isNegligible = whole === 0n && displayFraction.split("").every((d) => d === "0")
  if (isNegligible) {
    const fullValue = `${whole.toString()}.${padded}`.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")

    return (<CustomTooltip text={fullValue} position="left">
      <span className={className}>≈ 0</span>
    </CustomTooltip>)
  }

  const wholeFormatted = whole.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')

  return (
    <span className={`inline-flex items-baseline ${className}`}>
      <span>{wholeFormatted}</span>
      <span>.{displayFraction}</span>
      <span className="ml-1">{unit}</span>
    </span>
  )
}

export default function BalanceInfo({ activeTab = "stake" }: BalanceInfoProps) {
  const { connected, walletAddress, isLoading, balanceData } = useWallet()

  if (!connected || !walletAddress) return null

  const isDataLoading = isLoading || !balanceData

  return (
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-700 dark:text-gray-300">Total balance:</span>
          <BalanceSpan value={balanceData?.totalBalance} isLoading={isDataLoading} />
        </div>

        {activeTab === "stake" ? (
            <>
              <div className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300">Staked volume:</span>
                <BalanceSpan value={balanceData?.stakedBalance} isLoading={isDataLoading} />
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300">Pending unstake:</span>
                <BalanceSpan value={balanceData?.unstakedBalance} isLoading={isDataLoading} />
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300">Available to stake:</span>
                <BalanceSpan value={balanceData?.availableBalance} isLoading={isDataLoading} />
              </div>
            </>
        ) : (
            <>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Pending unstake:</span>
                <BalanceSpan value={balanceData?.unstakedBalance} isLoading={isDataLoading} />
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Staked volume:</span>
                <BalanceSpan value={balanceData?.stakedBalance} isLoading={isDataLoading} />
              </div>
            </>
        )}
      </div>
  )
}