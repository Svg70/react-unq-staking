"use client"

import { useState, useEffect, useMemo } from "react"
import { useWallet } from "@/context/wallet-context"
import {
  fetchStakingHistory,
  fetchTransferHistory,
  type StakingHistoryItem,
  type BalanceTransferItem,
} from "@/utils/staking-api"
import { RefreshCw } from "lucide-react"
import {StakingRewardsTable, StakingTable, TransfersTable, UnstakingTable} from '@/components/tables.tsx';

type TabType = "staking" | "unstaking" | "rewards" | "transfers"

export default function StakingHistory() {
  const { connected, walletAddress, registerRefreshCallback, tokenSymbol } = useWallet()
  const [activeTab, setActiveTab] = useState<TabType>("staking")
  const [stakingTransactions, setStakingTransactions] = useState<StakingHistoryItem[]>([])
  const [transferTransactions, setTransferTransactions] = useState<BalanceTransferItem[]>([])
  const [stakingRewards, setStakingRewards] = useState<BalanceTransferItem[]>([])
  const [stakingLoading, setStakingLoading] = useState(false)
  const [transfersLoading, setTransfersLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const {stake, unstake} = useMemo(() => {
    const stake = stakingTransactions.filter((tx) => tx.eventType === "Stake")
    const unstake = stakingTransactions.filter((tx) => tx.eventType === "Unstake")

    return { stake, unstake }
  }, [stakingTransactions])

  const chain = useMemo(() => {
    if (tokenSymbol === "QTZ") return "quartz"
    return "unique"
  }, [tokenSymbol])

  async function fetchStakingData() {
    if (!connected || !walletAddress) return

    setStakingLoading(true)
    try {
      const transactions = await fetchStakingHistory(walletAddress, tokenSymbol)
      setStakingTransactions(transactions)
    } catch (error) {
      console.error("Failed to load staking history:", error)
    } finally {
      setStakingLoading(false)
    }
  }

  async function fetchTransferData() {
    if (!connected || !walletAddress) return

    setTransfersLoading(true)
    try {
      const transactions = await fetchTransferHistory(walletAddress, tokenSymbol)
      setTransferTransactions(transactions.transfers)
      setStakingRewards(transactions.stakingRewards)
    } catch (error) {
      console.error("Failed to load transfer history:", error)
    } finally {
      setTransfersLoading(false)
    }
  }

  const refreshTransactions = async () => {
    if (isRefreshing || !connected || !walletAddress) return

    setIsRefreshing(true)
    try {
      await Promise.all([
        fetchStakingData(),
        fetchTransferData(),
      ])
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    async function loadInitialData() {
      if (!connected || !walletAddress || !isMounted) return

      try {
        await Promise.all([fetchStakingData(), fetchTransferData()])
      } catch (error) {
        console.error("Failed to load transaction history:", error)
      }
    }

    if (connected && walletAddress) {
      loadInitialData()
    }

    return () => {
      isMounted = false
    }
  }, [connected, walletAddress, tokenSymbol])

  useEffect(() => {
    const unregister = registerRefreshCallback(refreshTransactions)
    return unregister
  }, [registerRefreshCallback])

  if (!connected) {
    return null
  }

  return (
      <section className="py-12 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Your Transaction History</h2>
            <button
                onClick={refreshTransactions}
                disabled={isRefreshing || stakingLoading || transfersLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`w-4 h-4 !fill-none ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-600">
              <div className="flex">
                <button
                    className={`px-6 py-3 text-sm font-medium ${
                        activeTab === "staking"
                            ? 'border-b-2 border-blue-500 text-blue-500'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                    onClick={() => setActiveTab("staking")}
                >
                  Staking ({stake.length})
                </button>
                <button
                    className={`px-6 py-3 text-sm font-medium ${
                        activeTab === "unstaking"
                            ? 'border-b-2 border-blue-500 text-blue-500'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                    onClick={() => setActiveTab("unstaking")}
                >
                  Unstaking ({unstake.length})
                </button>
                <button
                    className={`px-6 py-3 text-sm font-medium ${
                        activeTab === "rewards"
                            ? 'border-b-2 border-blue-500 text-blue-500'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                    onClick={() => setActiveTab("rewards")}
                >
                  Rewards ({stakingRewards.length})
                </button>
                <button
                    className={`px-6 py-3 text-sm font-medium ${
                        activeTab === "transfers"
                            ? 'border-b-2 border-blue-500 text-blue-500'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                    onClick={() => setActiveTab("transfers")}
                >
                  Transfers ({transferTransactions.length})
                </button>
              </div>
            </div>

            <div className="p-6">
              {activeTab === "staking" ? (
                  stakingLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                      </div>
                  ) : stake.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-500 dark:text-gray-400">No staking history found</p>
                      </div>
                  ) : (
                      <div className="overflow-x-auto">
                        <StakingTable stake={stake} chain={chain} />
                      </div>
                  )
              ) : activeTab === "unstaking" ? (
                  stakingLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                      </div>
                  ) : unstake.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-500 dark:text-gray-400">No unstaking history found</p>
                      </div>
                  ) : (
                      <div className="overflow-x-auto">
                        <UnstakingTable unStake={unstake} chain={chain} />
                      </div>
                  )
              ) : transfersLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  </div>
              ) : transferTransactions.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-gray-500 dark:text-gray-400">No transfer transactions found</p>
                  </div>
              ) : activeTab === 'transfers' ? (
                  <div className="overflow-x-auto">
                    <TransfersTable transfers={transferTransactions} chain={chain} />
                  </div>
              ) : (
                  <div className="overflow-x-auto">
                    <StakingRewardsTable stakingRewards={stakingRewards} chain={chain} />
                  </div>
              )}
            </div>
          </div>
        </div>
      </section>
  )
}