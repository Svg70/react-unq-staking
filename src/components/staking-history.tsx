"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/context/wallet-context"
import {
  fetchStakingHistory,
  fetchTransferHistory,
  formatDate,
  formatHash,
  formatAmount,
  type StakingHistoryItem,
} from "@/utils/staking-api"
import { RefreshCw } from "lucide-react"
import { cn } from "../lib/utils"

export default function StakingHistory() {
  const { connected, walletAddress, registerRefreshCallback, tokenSymbol } = useWallet()
  const [activeTab, setActiveTab] = useState("staking")
  const [stakingTransactions, setStakingTransactions] = useState<StakingHistoryItem[]>([])
  const [transferTransactions, setTransferTransactions] = useState<any[]>([])
  const [stakingLoading, setStakingLoading] = useState(false)
  const [transfersLoading, setTransfersLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const stake = stakingTransactions.filter((tx) => tx.eventType === "Stake")
  const unstake = stakingTransactions.filter((tx) => tx.eventType === "Unstake")

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
      setTransferTransactions(transactions)
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
      await Promise.all([fetchStakingData(), fetchTransferData()])
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
      <section className={cn("st-py-12", "st-bg-white", "dark:st-bg-gray-800")}>
        <div className={cn("st-container", "st-mx-auto", "st-px-4")}>
          <div className={cn("st-flex", "st-justify-between", "st-items-center", "st-mb-6")}>
            <h2 className={cn("st-text-2xl", "st-font-bold")}>Your Transaction History</h2>
            <button
                onClick={refreshTransactions}
                disabled={isRefreshing || stakingLoading || transfersLoading}
                className={cn(
                    "st-flex", "st-items-center", "st-gap-2", "st-px-4", "st-py-2", "st-bg-blue-500", "st-text-white", "st-rounded-md",
                    "st-hover:bg-blue-600", "st-disabled:opacity-50", "st-disabled:cursor-not-allowed", "st-transition-colors"
                )}
            >
              <RefreshCw className={cn("st-w-4", "st-h-4", isRefreshing ? "st-animate-spin" : "")} />
              Refresh
            </button>
          </div>

          <div className={cn("st-bg-white", "dark:st-bg-gray-700", "st-rounded-lg", "st-shadow-md", "st-overflow-hidden")}>
            <div className={cn("st-border-b", "st-border-gray-200", "dark:st-border-gray-600")}>
              <div className={cn("st-flex")}>
                <button
                    className={cn(
                        "st-px-6", "st-py-3", "st-text-sm", "st-font-medium",
                        activeTab === "staking"
                            ? ["st-border-b-2", "st-border-blue-500", "st-text-blue-500"]
                            : ["st-text-gray-500", "st-hover:text-gray-700", "dark:st-text-gray-400", "dark:st-hover:text-gray-200"]
                    )}
                    onClick={() => setActiveTab("staking")}
                >
                  Staking History ({stake.length})
                </button>
                <button
                    className={cn(
                        "st-px-6", "st-py-3", "st-text-sm", "st-font-medium",
                        activeTab === "unstaking"
                            ? ["st-border-b-2", "st-border-blue-500", "st-text-blue-500"]
                            : ["st-text-gray-500", "st-hover:text-gray-700", "dark:st-text-gray-400", "dark:st-hover:text-gray-200"]
                    )}
                    onClick={() => setActiveTab("unstaking")}
                >
                  Unstaking History ({unstake.length})
                </button>
                <button
                    className={cn(
                        "st-px-6", "st-py-3", "st-text-sm", "st-font-medium",
                        activeTab === "transfers"
                            ? ["st-border-b-2", "st-border-blue-500", "st-text-blue-500"]
                            : ["st-text-gray-500", "st-hover:text-gray-700", "dark:st-text-gray-400", "dark:st-hover:text-gray-200"]
                    )}
                    onClick={() => setActiveTab("transfers")}
                >
                  Transfers ({transferTransactions.length})
                </button>
              </div>
            </div>

            <div className={cn("st-p-6")}>
              {activeTab === "staking" ? (
                  stakingLoading ? (
                      <div className={cn("st-flex", "st-justify-center", "st-py-8")}>
                        <div className={cn("st-animate-spin", "st-rounded-full", "st-h-12", "st-w-12", "st-border-b-2", "st-border-blue-500")}></div>
                      </div>
                  ) : stake.length === 0 ? (
                      <div className={cn("st-text-center", "st-py-8", "st-bg-gray-50", "dark:st-bg-gray-700", "st-rounded-lg")}>
                        <p className={cn("st-text-gray-500", "dark:st-text-gray-400")}>No staking history found</p>
                      </div>
                  ) : (
                      <div className={cn("st-overflow-x-auto")}>
                        <table className={cn("st-min-w-full", "st-bg-white", "dark:st-bg-gray-800", "st-rounded-lg", "st-overflow-hidden")}>
                          <thead className={cn("st-bg-gray-50", "dark:st-bg-gray-700")}>
                          <tr>
                            <th className={cn("st-px-6", "st-py-3", "st-text-left", "st-text-xs", "st-font-medium", "st-text-gray-500", "dark:st-text-gray-300", "st-uppercase", "st-tracking-wider")}>
                              Block
                            </th>
                            <th className={cn("st-px-6", "st-py-3", "st-text-left", "st-text-xs", "st-font-medium", "st-text-gray-500", "dark:st-text-gray-300", "st-uppercase", "st-tracking-wider")}>
                              Hash
                            </th>
                            <th className={cn("st-px-6", "st-py-3", "st-text-left", "st-text-xs", "st-font-medium", "st-text-gray-500", "dark:st-text-gray-300", "st-uppercase", "st-tracking-wider")}>
                              Time
                            </th>
                            <th className={cn("st-px-6", "st-py-3", "st-text-left", "st-text-xs", "st-font-medium", "st-text-gray-500", "dark:st-text-gray-300", "st-uppercase", "st-tracking-wider")}>
                              Status
                            </th>
                            <th className={cn("st-px-6", "st-py-3", "st-text-left", "st-text-xs", "st-font-medium", "st-text-gray-500", "dark:st-text-gray-300", "st-uppercase", "st-tracking-wider")}>
                              Method
                            </th>
                            <th className={cn("st-px-6", "st-py-3", "st-text-right", "st-text-xs", "st-font-medium", "st-text-gray-500", "dark:st-text-gray-300", "st-uppercase", "st-tracking-wider")}>
                              Amount
                            </th>
                          </tr>
                          </thead>
                          <tbody className={cn("st-divide-y", "st-divide-gray-200", "dark:st-divide-gray-700")}>
                          {stake.map((tx, index) => (
                              <tr key={index} className={cn("st-hover:bg-gray-50", "dark:st-hover:bg-gray-700")}>
                                <td className={cn("st-px-6", "st-py-4", "st-whitespace-nowrap", "st-text-sm", "st-font-medium", "st-text-gray-900", "dark:st-text-gray-100")}>
                                  {tx.blockNumber}
                                </td>
                                <td className={cn("st-px-6", "st-py-4", "st-whitespace-nowrap", "st-text-sm", "st-font-mono")}>
                                  <a
                                      href={`https://unique.subscan.io/extrinsic/${tx.hash}?tab=event`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={cn("st-text-blue-600", "st-hover:text-blue-800", "st-hover:underline")}
                                  >
                                    {formatHash(tx.hash)}
                                  </a>
                                </td>
                                <td className={cn("st-px-6", "st-py-4", "st-whitespace-nowrap", "st-text-sm", "st-text-gray-600", "dark:st-text-gray-400")}>
                                  {formatDate(tx.createdAt)}
                                </td>
                                <td className={cn("st-px-6", "st-py-4")}>
                          <span className={cn("st-inline-flex", "st-items-center", "st-rounded-full", "st-bg-green-50", "st-px-2", "st-py-1", "st-text-xs", "st-font-medium", "st-text-green-700", "dark:st-bg-green-800", "dark:st-text-green-100")}>
                            Success
                          </span>
                                </td>
                                <td className={cn("st-px-6", "st-py-4")}>
                          <span className={cn("st-text-sm", "st-text-gray-700", "dark:st-text-gray-300")}>
                            {tx.section} ({tx.method})
                          </span>
                                </td>
                                <td className={cn("st-px-6", "st-py-4", "st-text-right", "st-font-mono", "st-text-sm", "st-text-gray-900", "dark:st-text-gray-100")}>
                                  {formatAmount(tx.amount)}
                                </td>
                              </tr>
                          ))}
                          </tbody>
                        </table>
                      </div>
                  )
              ) : activeTab === "unstaking" ? (
                  stakingLoading ? (
                      <div className={cn("st-flex", "st-justify-center", "st-py-8")}>
                        <div className={cn("st-animate-spin", "st-rounded-full", "st-h-12", "st-w-12", "st-border-b-2", "st-border-blue-500")}></div>
                      </div>
                  ) : unstake.length === 0 ? (
                      <div className={cn("st-text-center", "st-py-8", "st-bg-gray-50", "dark:st-bg-gray-700", "st-rounded-lg")}>
                        <p className={cn("st-text-gray-500", "dark:st-text-gray-400")}>No unstaking history found</p>
                      </div>
                  ) : (
                      <div className={cn("st-overflow-x-auto")}>
                        <table className={cn("st-min-w-full", "st-bg-white", "dark:st-bg-gray-800", "st-rounded-lg", "st-overflow-hidden")}>
                          <thead className={cn("st-bg-gray-50", "dark:st-bg-gray-700")}>
                          <tr>
                            <th className={cn("st-px-6", "st-py-3", "st-text-left", "st-text-xs", "st-font-medium", "st-text-gray-500", "dark:st-text-gray-300", "st-uppercase", "st-tracking-wider")}>
                              Block
                            </th>
                            <th className={cn("st-px-6", "st-py-3", "st-text-left", "st-text-xs", "st-font-medium", "st-text-gray-500", "dark:st-text-gray-300", "st-uppercase", "st-tracking-wider")}>
                              Hash
                            </th>
                            <th className={cn("st-px-6", "st-py-3", "st-text-left", "st-text-xs", "st-font-medium", "st-text-gray-500", "dark:st-text-gray-300", "st-uppercase", "st-tracking-wider")}>
                              Time
                            </th>
                            <th className={cn("st-px-6", "st-py-3", "st-text-left", "st-text-xs", "st-font-medium", "st-text-gray-500", "dark:st-text-gray-300", "st-uppercase", "st-tracking-wider")}>
                              Status
                            </th>
                            <th className={cn("st-px-6", "st-py-3", "st-text-left", "st-text-xs", "st-font-medium", "st-text-gray-500", "dark:st-text-gray-300", "st-uppercase", "st-tracking-wider")}>
                              Method
                            </th>
                            <th className={cn("st-px-6", "st-py-3", "st-text-right", "st-text-xs", "st-font-medium", "st-text-gray-500", "dark:st-text-gray-300", "st-uppercase", "st-tracking-wider")}>
                              Amount
                            </th>
                          </tr>
                          </thead>
                          <tbody className={cn("st-divide-y", "st-divide-gray-200", "dark:st-divide-gray-700")}>
                          {unstake.map((tx, index) => (
                              <tr key={index} className={cn("st-hover:bg-gray-50", "dark:st-hover:bg-gray-700")}>
                                <td className={cn("st-px-6", "st-py-4", "st-whitespace-nowrap", "st-text-sm", "st-font-medium", "st-text-gray-900", "dark:st-text-gray-100")}>
                                  {tx.blockNumber}
                                </td>
                                <td className={cn("st-px-6", "st-py-4", "st-whitespace-nowrap", "st-text-sm", "st-font-mono")}>
                                  <a
                                      href={`https://unique.subscan.io/extrinsic/${tx.hash}?tab=event`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={cn("st-text-blue-600", "st-hover:text-blue-800", "st-hover:underline")}
                                  >
                                    {formatHash(tx.hash)}
                                  </a>
                                </td>
                                <td className={cn("st-px-6", "st-py-4", "st-whitespace-nowrap", "st-text-sm", "st-text-gray-600", "dark:st-text-gray-400")}>
                                  {formatDate(tx.createdAt)}
                                </td>
                                <td className={cn("st-px-6", "st-py-4")}>
                          <span className={cn("st-inline-flex", "st-items-center", "st-rounded-full", "st-bg-green-50", "st-px-2", "st-py-1", "st-text-xs", "st-font-medium", "st-text-green-700", "dark:st-bg-green-800", "dark:st-text-green-100")}>
                            Success
                          </span>
                                </td>
                                <td className={cn("st-px-6", "st-py-4")}>
                          <span className={cn("st-text-sm", "st-text-gray-700", "dark:st-text-gray-300")}>
                            {tx.section} ({tx.method})
                          </span>
                                </td>
                                <td className={cn("st-px-6", "st-py-4", "st-text-right", "st-font-mono", "st-text-sm", "st-text-gray-900", "dark:st-text-gray-100")}>
                                  {formatAmount(tx.amount)}
                                </td>
                              </tr>
                          ))}
                          </tbody>
                        </table>
                      </div>
                  )
              ) : transfersLoading ? (
                  <div className={cn("st-flex", "st-justify-center", "st-py-8")}>
                    <div className={cn("st-animate-spin", "st-rounded-full", "st-h-12", "st-w-12", "st-border-b-2", "st-border-blue-500")}></div>
                  </div>
              ) : transferTransactions.length === 0 ? (
                  <div className={cn("st-text-center", "st-py-8", "st-bg-gray-50", "dark:st-bg-gray-700", "st-rounded-lg")}>
                    <p className={cn("st-text-gray-500", "dark:st-text-gray-400")}>No transfer transactions found</p>
                  </div>
              ) : (
                  <div className={cn("st-overflow-x-auto")}>
                    <table className={cn("st-min-w-full", "st-bg-white", "dark:st-bg-gray-800", "st-rounded-lg", "st-overflow-hidden")}>
                      <thead className={cn("st-bg-gray-50", "dark:st-bg-gray-700")}>
                      <tr>
                        <th className={cn("st-px-6", "st-py-3", "st-text-left", "st-text-xs", "st-font-medium", "st-text-gray-500", "dark:st-text-gray-300", "st-uppercase", "st-tracking-wider")}>
                          Block
                        </th>
                        <th className={cn("st-px-6", "st-py-3", "st-text-left", "st-text-xs", "st-font-medium", "st-text-gray-500", "dark:st-text-gray-300", "st-uppercase", "st-tracking-wider")}>
                          Hash
                        </th>
                        <th className={cn("st-px-6", "st-py-3", "st-text-left", "st-text-xs", "st-font-medium", "st-text-gray-500", "dark:st-text-gray-300", "st-uppercase", "st-tracking-wider")}>
                          Time
                        </th>
                        <th className={cn("st-px-6", "st-py-3", "st-text-left", "st-text-xs", "st-font-medium", "st-text-gray-500", "dark:st-text-gray-300", "st-uppercase", "st-tracking-wider")}>
                          Status
                        </th>
                        <th className={cn("st-px-6", "st-py-3", "st-text-left", "st-text-xs", "st-font-medium", "st-text-gray-500", "dark:st-text-gray-300", "st-uppercase", "st-tracking-wider")}>
                          Method
                        </th>
                        <th className={cn("st-px-6", "st-py-3", "st-text-right", "st-text-xs", "st-font-medium", "st-text-gray-500", "dark:st-text-gray-300", "st-uppercase", "st-tracking-wider")}>
                          Amount
                        </th>
                      </tr>
                      </thead>
                      <tbody className={cn("st-divide-y", "st-divide-gray-200", "dark:st-divide-gray-700")}>
                      {transferTransactions.map((tx, index) => (
                          <tr key={index} className={cn("st-hover:bg-gray-50", "dark:st-hover:bg-gray-700")}>
                            <td className={cn("st-px-6", "st-py-4", "st-whitespace-nowrap", "st-text-sm", "st-font-medium", "st-text-gray-900", "dark:st-text-gray-100")}>
                              {tx.blockNumber}
                            </td>
                            <td className={cn("st-px-6", "st-py-4", "st-whitespace-nowrap", "st-text-sm", "st-font-mono")}>
                              <a
                                  href={`https://unique.subscan.io/extrinsic/${tx.hash}?tab=event`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={cn("st-text-blue-600", "st-hover:text-blue-800", "st-hover:underline")}
                              >
                                {formatHash(tx.hash)}
                              </a>
                            </td>
                            <td className={cn("st-px-6", "st-py-4", "st-whitespace-nowrap", "st-text-sm", "st-text-gray-600", "dark:st-text-gray-400")}>
                              {formatDate(tx.createdAt)}
                            </td>
                            <td className={cn("st-px-6", "st-py-4")}>
                        <span className={cn("st-inline-flex", "st-items-center", "st-rounded-full", "st-bg-green-50", "st-px-2", "st-py-1", "st-text-xs", "st-font-medium", "st-text-green-700", "dark:st-bg-green-800", "dark:st-text-green-100")}>
                          Success
                        </span>
                            </td>
                            <td className={cn("st-px-6", "st-py-4")}>
                        <span className={cn("st-text-sm", "st-text-gray-700", "dark:st-text-gray-300")}>
                          {tx.section} ({tx.method})
                        </span>
                            </td>
                            <td className={cn("st-px-6", "st-py-4", "st-text-right", "st-font-mono", "st-text-sm", "st-text-gray-900", "dark:st-text-gray-100")}>
                              {formatAmount(tx.amount)}
                            </td>
                          </tr>
                      ))}
                      </tbody>
                    </table>
                  </div>
              )}
            </div>
          </div>
        </div>
      </section>
  )
}