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
  const { connected, walletAddress, registerRefreshCallback } = useWallet()
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
      const transactions = await fetchStakingHistory(walletAddress)
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
      const transactions = await fetchTransferHistory(walletAddress)
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
  }, [connected, walletAddress])

  useEffect(() => {
    const unregister = registerRefreshCallback(refreshTransactions)
    return unregister
  }, [registerRefreshCallback])

  if (!connected) {
    return null
  }

  return (
    <section className={cn("py-12", "bg-white", "dark:bg-gray-800")}>
      <div className={cn("container", "mx-auto", "px-4")}>
        <div className={cn("flex", "justify-between", "items-center", "mb-6")}>
          <h2 className={cn("text-2xl", "font-bold")}>Your Transaction History</h2>
          <button
            onClick={refreshTransactions}
            disabled={isRefreshing || stakingLoading || transfersLoading}
            className={cn(
              "flex", "items-center", "gap-2", "px-4", "py-2", "bg-blue-500", "text-white", "rounded-md",
              "hover:bg-blue-600", "disabled:opacity-50", "disabled:cursor-not-allowed", "transition-colors"
            )}
          >
            <RefreshCw className={cn("w-4", "h-4", isRefreshing ? "animate-spin" : "")} />
            Refresh
          </button>
        </div>

        <div className={cn("bg-white", "dark:bg-gray-700", "rounded-lg", "shadow-md", "overflow-hidden")}>
          <div className={cn("border-b", "border-gray-200", "dark:border-gray-600")}>
            <div className={cn("flex")}>
              <button
                className={cn(
                  "px-6", "py-3", "text-sm", "font-medium",
                  activeTab === "staking"
                    ? ["border-b-2", "border-blue-500", "text-blue-500"]
                    : ["text-gray-500", "hover:text-gray-700", "dark:text-gray-400", "dark:hover:text-gray-200"]
                )}
                onClick={() => setActiveTab("staking")}
              >
                Staking History ({stake.length})
              </button>
              <button
                className={cn(
                  "px-6", "py-3", "text-sm", "font-medium",
                  activeTab === "unstaking"
                    ? ["border-b-2", "border-blue-500", "text-blue-500"]
                    : ["text-gray-500", "hover:text-gray-700", "dark:text-gray-400", "dark:hover:text-gray-200"]
                )}
                onClick={() => setActiveTab("unstaking")}
              >
                Unstaking History ({unstake.length})
              </button>
              <button
                className={cn(
                  "px-6", "py-3", "text-sm", "font-medium",
                  activeTab === "transfers"
                    ? ["border-b-2", "border-blue-500", "text-blue-500"]
                    : ["text-gray-500", "hover:text-gray-700", "dark:text-gray-400", "dark:hover:text-gray-200"]
                )}
                onClick={() => setActiveTab("transfers")}
              >
                Transfers ({transferTransactions.length})
              </button>
            </div>
          </div>

          <div className={cn("p-6")}>
            {activeTab === "staking" ? (
              stakingLoading ? (
                <div className={cn("flex", "justify-center", "py-8")}>
                  <div className={cn("animate-spin", "rounded-full", "h-12", "w-12", "border-b-2", "border-blue-500")}></div>
                </div>
              ) : stake.length === 0 ? (
                <div className={cn("text-center", "py-8", "bg-gray-50", "dark:bg-gray-700", "rounded-lg")}>
                  <p className={cn("text-gray-500", "dark:text-gray-400")}>No staking history found</p>
                </div>
              ) : (
                <div className={cn("overflow-x-auto")}>
                  <table className={cn("min-w-full", "bg-white", "dark:bg-gray-800", "rounded-lg", "overflow-hidden")}>
                    <thead className={cn("bg-gray-50", "dark:bg-gray-700")}>
                      <tr>
                        <th className={cn("px-6", "py-3", "text-left", "text-xs", "font-medium", "text-gray-500", "dark:text-gray-300", "uppercase", "tracking-wider")}>
                          Block
                        </th>
                        <th className={cn("px-6", "py-3", "text-left", "text-xs", "font-medium", "text-gray-500", "dark:text-gray-300", "uppercase", "tracking-wider")}>
                          Hash
                        </th>
                        <th className={cn("px-6", "py-3", "text-left", "text-xs", "font-medium", "text-gray-500", "dark:text-gray-300", "uppercase", "tracking-wider")}>
                          Time
                        </th>
                        <th className={cn("px-6", "py-3", "text-left", "text-xs", "font-medium", "text-gray-500", "dark:text-gray-300", "uppercase", "tracking-wider")}>
                          Status
                        </th>
                        <th className={cn("px-6", "py-3", "text-left", "text-xs", "font-medium", "text-gray-500", "dark:text-gray-300", "uppercase", "tracking-wider")}>
                          Method
                        </th>
                        <th className={cn("px-6", "py-3", "text-right", "text-xs", "font-medium", "text-gray-500", "dark:text-gray-300", "uppercase", "tracking-wider")}>
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className={cn("divide-y", "divide-gray-200", "dark:divide-gray-700")}>
                      {stake.map((tx, index) => (
                        <tr key={index} className={cn("hover:bg-gray-50", "dark:hover:bg-gray-700")}>
                          <td className={cn("px-6", "py-4", "whitespace-nowrap", "text-sm", "font-medium", "text-gray-900", "dark:text-gray-100")}>
                            {tx.blockNumber}
                          </td>
                          <td className={cn("px-6", "py-4", "whitespace-nowrap", "text-sm", "font-mono")}>
                            <a
                              href={`https://unique.subscan.io/extrinsic/${tx.hash}?tab=event`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={cn("text-blue-600", "hover:text-blue-800", "hover:underline")}
                            >
                              {formatHash(tx.hash)}
                            </a>
                          </td>
                          <td className={cn("px-6", "py-4", "whitespace-nowrap", "text-sm", "text-gray-600", "dark:text-gray-400")}>
                            {formatDate(tx.createdAt)}
                          </td>
                          <td className={cn("px-6", "py-4")}>
                            <span className={cn("inline-flex", "items-center", "rounded-full", "bg-green-50", "px-2", "py-1", "text-xs", "font-medium", "text-green-700", "dark:bg-green-800", "dark:text-green-100")}>
                              Success
                            </span>
                          </td>
                          <td className={cn("px-6", "py-4")}>
                            <span className={cn("text-sm", "text-gray-700", "dark:text-gray-300")}>
                              {tx.section} ({tx.method})
                            </span>
                          </td>
                          <td className={cn("px-6", "py-4", "text-right", "font-mono", "text-sm", "text-gray-900", "dark:text-gray-100")}>
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
                <div className={cn("flex", "justify-center", "py-8")}>
                  <div className={cn("animate-spin", "rounded-full", "h-12", "w-12", "border-b-2", "border-blue-500")}></div>
                </div>
              ) : unstake.length === 0 ? (
                <div className={cn("text-center", "py-8", "bg-gray-50", "dark:bg-gray-700", "rounded-lg")}>
                  <p className={cn("text-gray-500", "dark:text-gray-400")}>No unstaking history found</p>
                </div>
              ) : (
                <div className={cn("overflow-x-auto")}>
                  <table className={cn("min-w-full", "bg-white", "dark:bg-gray-800", "rounded-lg", "overflow-hidden")}>
                    <thead className={cn("bg-gray-50", "dark:bg-gray-700")}>
                      <tr>
                        <th className={cn("px-6", "py-3", "text-left", "text-xs", "font-medium", "text-gray-500", "dark:text-gray-300", "uppercase", "tracking-wider")}>
                          Block
                        </th>
                        <th className={cn("px-6", "py-3", "text-left", "text-xs", "font-medium", "text-gray-500", "dark:text-gray-300", "uppercase", "tracking-wider")}>
                          Hash
                        </th>
                        <th className={cn("px-6", "py-3", "text-left", "text-xs", "font-medium", "text-gray-500", "dark:text-gray-300", "uppercase", "tracking-wider")}>
                          Time
                        </th>
                        <th className={cn("px-6", "py-3", "text-left", "text-xs", "font-medium", "text-gray-500", "dark:text-gray-300", "uppercase", "tracking-wider")}>
                          Status
                        </th>
                        <th className={cn("px-6", "py-3", "text-left", "text-xs", "font-medium", "text-gray-500", "dark:text-gray-300", "uppercase", "tracking-wider")}>
                          Method
                        </th>
                        <th className={cn("px-6", "py-3", "text-right", "text-xs", "font-medium", "text-gray-500", "dark:text-gray-300", "uppercase", "tracking-wider")}>
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className={cn("divide-y", "divide-gray-200", "dark:divide-gray-700")}>
                      {unstake.map((tx, index) => (
                        <tr key={index} className={cn("hover:bg-gray-50", "dark:hover:bg-gray-700")}>
                          <td className={cn("px-6", "py-4", "whitespace-nowrap", "text-sm", "font-medium", "text-gray-900", "dark:text-gray-100")}>
                            {tx.blockNumber}
                          </td>
                          <td className={cn("px-6", "py-4", "whitespace-nowrap", "text-sm", "font-mono")}>
                            <a
                              href={`https://unique.subscan.io/extrinsic/${tx.hash}?tab=event`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={cn("text-blue-600", "hover:text-blue-800", "hover:underline")}
                            >
                              {formatHash(tx.hash)}
                            </a>
                          </td>
                          <td className={cn("px-6", "py-4", "whitespace-nowrap", "text-sm", "text-gray-600", "dark:text-gray-400")}>
                            {formatDate(tx.createdAt)}
                          </td>
                          <td className={cn("px-6", "py-4")}>
                            <span className={cn("inline-flex", "items-center", "rounded-full", "bg-green-50", "px-2", "py-1", "text-xs", "font-medium", "text-green-700", "dark:bg-green-800", "dark:text-green-100")}>
                              Success
                            </span>
                          </td>
                          <td className={cn("px-6", "py-4")}>
                            <span className={cn("text-sm", "text-gray-700", "dark:text-gray-300")}>
                              {tx.section} ({tx.method})
                            </span>
                          </td>
                          <td className={cn("px-6", "py-4", "text-right", "font-mono", "text-sm", "text-gray-900", "dark:text-gray-100")}>
                            {formatAmount(tx.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : transfersLoading ? (
              <div className={cn("flex", "justify-center", "py-8")}>
                <div className={cn("animate-spin", "rounded-full", "h-12", "w-12", "border-b-2", "border-blue-500")}></div>
              </div>
            ) : transferTransactions.length === 0 ? (
              <div className={cn("text-center", "py-8", "bg-gray-50", "dark:bg-gray-700", "rounded-lg")}>
                <p className={cn("text-gray-500", "dark:text-gray-400")}>No transfer transactions found</p>
              </div>
            ) : (
              <div className={cn("overflow-x-auto")}>
                <table className={cn("min-w-full", "bg-white", "dark:bg-gray-800", "rounded-lg", "overflow-hidden")}>
                  <thead className={cn("bg-gray-50", "dark:bg-gray-700")}>
                    <tr>
                      <th className={cn("px-6", "py-3", "text-left", "text-xs", "font-medium", "text-gray-500", "dark:text-gray-300", "uppercase", "tracking-wider")}>
                        Block
                      </th>
                      <th className={cn("px-6", "py-3", "text-left", "text-xs", "font-medium", "text-gray-500", "dark:text-gray-300", "uppercase", "tracking-wider")}>
                        Hash
                      </th>
                      <th className={cn("px-6", "py-3", "text-left", "text-xs", "font-medium", "text-gray-500", "dark:text-gray-300", "uppercase", "tracking-wider")}>
                        Time
                      </th>
                      <th className={cn("px-6", "py-3", "text-left", "text-xs", "font-medium", "text-gray-500", "dark:text-gray-300", "uppercase", "tracking-wider")}>
                        Status
                      </th>
                      <th className={cn("px-6", "py-3", "text-left", "text-xs", "font-medium", "text-gray-500", "dark:text-gray-300", "uppercase", "tracking-wider")}>
                        Method
                      </th>
                      <th className={cn("px-6", "py-3", "text-right", "text-xs", "font-medium", "text-gray-500", "dark:text-gray-300", "uppercase", "tracking-wider")}>
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className={cn("divide-y", "divide-gray-200", "dark:divide-gray-700")}>
                    {transferTransactions.map((tx, index) => (
                      <tr key={index} className={cn("hover:bg-gray-50", "dark:hover:bg-gray-700")}>
                        <td className={cn("px-6", "py-4", "whitespace-nowrap", "text-sm", "font-medium", "text-gray-900", "dark:text-gray-100")}>
                          {tx.blockNumber}
                        </td>
                        <td className={cn("px-6", "py-4", "whitespace-nowrap", "text-sm", "font-mono")}>
                          <a
                            href={`https://unique.subscan.io/extrinsic/${tx.hash}?tab=event`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn("text-blue-600", "hover:text-blue-800", "hover:underline")}
                          >
                            {formatHash(tx.hash)}
                          </a>
                        </td>
                        <td className={cn("px-6", "py-4", "whitespace-nowrap", "text-sm", "text-gray-600", "dark:text-gray-400")}>
                          {formatDate(tx.createdAt)}
                        </td>
                        <td className={cn("px-6", "py-4")}>
                          <span className={cn("inline-flex", "items-center", "rounded-full", "bg-green-50", "px-2", "py-1", "text-xs", "font-medium", "text-green-700", "dark:bg-green-800", "dark:text-green-100")}>
                            Success
                          </span>
                        </td>
                        <td className={cn("px-6", "py-4")}>
                          <span className={cn("text-sm", "text-gray-700", "dark:text-gray-300")}>
                            {tx.section} ({tx.method})
                          </span>
                        </td>
                        <td className={cn("px-6", "py-4", "text-right", "font-mono", "text-sm", "text-gray-900", "dark:text-gray-100")}>
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