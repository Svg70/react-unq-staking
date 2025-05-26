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
    <section className={cn("py-12 bg-gray-50 dark:bg-gray-900")}>
      <div className={cn("container mx-auto px-4")}>
        <h2 className={cn("text-2xl font-bold mb-8 text-center")}>Your Staking Analytics</h2>

        <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6")}>
          <div className={cn("bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md")}>
            <h3 className={cn("text-lg font-medium text-gray-500 dark:text-gray-400 mb-2")}>Total Staked</h3>
            <p className={cn("text-2xl font-bold")}>{stats.totalStaked}</p>
          </div>

          <div className={cn("bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md")}>
            <h3 className={cn("text-lg font-medium text-gray-500 dark:text-gray-400 mb-2")}>Current APY</h3>
            <p className={cn("text-2xl font-bold text-green-500")}>{stats.apy}</p>
          </div>

          <div className={cn("bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md")}>
            <h3 className={cn("text-lg font-medium text-gray-500 dark:text-gray-400 mb-2")}>Est. Monthly Rewards</h3>
            <p className={cn("text-2xl font-bold")}>{stats.estimatedRewards}</p>
          </div>

          <div className={cn("bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md")}>
            <h3 className={cn("text-lg font-medium text-gray-500 dark:text-gray-400 mb-2")}>Staking Period</h3>
            <p className={cn("text-2xl font-bold")}>{stats.stakingPeriod}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
