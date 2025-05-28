"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/context/wallet-context"
import { cn } from "../lib/utils"

interface StakingStats {
  totalStaked: string
  apy: string
  estimatedRewards: string
  stakingPeriod: string
}

export default function StakingAnalytics() {
  const { connected, stakedBalance } = useWallet()
  const [stats, setStats] = useState<StakingStats>({
    totalStaked: "0 UNQ",
    apy: "18%",
    estimatedRewards: "0 UNQ",
    stakingPeriod: "30 days",
  })

  useEffect(() => {
    if (connected && stakedBalance) {
      const match = stakedBalance.match(/\d+(?:\.\d+)?/)
      if (match) {
        const stakedAmount = Number.parseFloat(match[0])
        const estimatedRewards = ((stakedAmount * 0.18) / 12).toFixed(2)

        setStats({
          totalStaked: stakedBalance,
          apy: "18%",
          estimatedRewards: `${estimatedRewards} UNQ`,
          stakingPeriod: "30 days",
        })
      }
    }
  }, [connected, stakedBalance])

  if (!connected) {
    return null
  }

  return (
      <section className={cn("st-py-12 st-bg-gray-50 dark:st-bg-gray-900")}>
        <div className={cn("st-container st-mx-auto st-px-4")}>
          <h2 className={cn("st-text-2xl st-font-bold st-mb-8 st-text-center")}>Your Staking Analytics</h2>

          <div className={cn("st-grid st-grid-cols-1 md:st-grid-cols-2 lg:st-grid-cols-4 st-gap-6")}>
            <div className={cn("st-bg-white dark:st-bg-gray-800 st-p-6 st-rounded-lg st-shadow-md")}>
              <h3 className={cn("st-text-lg st-font-medium st-text-gray-500 dark:st-text-gray-400 st-mb-2")}>Total Staked</h3>
              <p className={cn("st-text-2xl st-font-bold")}>{stats.totalStaked}</p>
            </div>

            <div className={cn("st-bg-white dark:st-bg-gray-800 st-p-6 st-rounded-lg st-shadow-md")}>
              <h3 className={cn("st-text-lg st-font-medium st-text-gray-500 dark:st-text-gray-400 st-mb-2")}>Current APY</h3>
              <p className={cn("st-text-2xl st-font-bold st-text-green-500")}>{stats.apy}</p>
            </div>

            <div className={cn("st-bg-white dark:st-bg-gray-800 st-p-6 st-rounded-lg st-shadow-md")}>
              <h3 className={cn("st-text-lg st-font-medium st-text-gray-500 dark:st-text-gray-400 st-mb-2")}>Est. Monthly Rewards</h3>
              <p className={cn("st-text-2xl st-font-bold")}>{stats.estimatedRewards}</p>
            </div>

            <div className={cn("st-bg-white dark:st-bg-gray-800 st-p-6 st-rounded-lg st-shadow-md")}>
              <h3 className={cn("st-text-lg st-font-medium st-text-gray-500 dark:st-text-gray-400 st-mb-2")}>Staking Period</h3>
              <p className={cn("st-text-2xl st-font-bold")}>{stats.stakingPeriod}</p>
            </div>
          </div>
        </div>
      </section>
  )
}
