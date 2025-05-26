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

const P = "react_unq_staking_app-"; // Наш префикс

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
    <section className={`react_unq_staking_app-py-12 react_unq_staking_app-bg-white dark:react_unq_staking_app-bg-gray-800`}>
      <div className={`react_unq_staking_app-container react_unq_staking_app-mx-auto react_unq_staking_app-px-4`}>
        <div className={`react_unq_staking_app-flex react_unq_staking_app-justify-between react_unq_staking_app-items-center react_unq_staking_app-mb-6`}>
          <h2 className={`react_unq_staking_app-text-2xl react_unq_staking_app-font-bold`}>Your Transaction History</h2>
          <button
            onClick={refreshTransactions}
            disabled={isRefreshing || stakingLoading || transfersLoading}
            className={`react_unq_staking_app-flex react_unq_staking_app-items-center react_unq_staking_app-gap-2 react_unq_staking_app-px-4 react_unq_staking_app-py-2 react_unq_staking_app-bg-blue-500 react_unq_staking_app-text-white react_unq_staking_app-rounded-md hover:react_unq_staking_app-bg-blue-600 disabled:react_unq_staking_app-opacity-50 disabled:react_unq_staking_app-cursor-not-allowed react_unq_staking_app-transition-colors`}
          >
            <RefreshCw className={`react_unq_staking_app-w-4 react_unq_staking_app-h-4 ${isRefreshing ? `react_unq_staking_app-animate-spin` : ""}`} />
            Refresh
          </button>
        </div>

        <div className={`react_unq_staking_app-bg-white dark:react_unq_staking_app-bg-gray-700 react_unq_staking_app-rounded-lg react_unq_staking_app-shadow-md react_unq_staking_app-overflow-hidden`}>
          <div className={`react_unq_staking_app-border-b react_unq_staking_app-border-gray-200 dark:react_unq_staking_app-border-gray-600`}>
            <div className={`react_unq_staking_app-flex`}>
              <button
                className={`react_unq_staking_app-px-6 react_unq_staking_app-py-3 react_unq_staking_app-text-sm react_unq_staking_app-font-medium ${
                  activeTab === "staking"
                    ? `react_unq_staking_app-border-b-2 react_unq_staking_app-border-blue-500 react_unq_staking_app-text-blue-500`
                    : `react_unq_staking_app-text-gray-500 hover:react_unq_staking_app-text-gray-700 dark:react_unq_staking_app-text-gray-400 dark:hover:react_unq_staking_app-text-gray-200`
                }`}
                onClick={() => setActiveTab("staking")}
              >
                Staking History ({stake.length})
              </button>
              <button
                className={`react_unq_staking_app-px-6 react_unq_staking_app-py-3 react_unq_staking_app-text-sm react_unq_staking_app-font-medium ${
                  activeTab === "unstaking"
                    ? `react_unq_staking_app-border-b-2 react_unq_staking_app-border-blue-500 react_unq_staking_app-text-blue-500`
                    : `react_unq_staking_app-text-gray-500 hover:react_unq_staking_app-text-gray-700 dark:react_unq_staking_app-text-gray-400 dark:hover:react_unq_staking_app-text-gray-200`
                }`}
                onClick={() => setActiveTab("unstaking")}
              >
                Unstaking History ({unstake.length})
              </button>
              <button
                className={`react_unq_staking_app-px-6 react_unq_staking_app-py-3 react_unq_staking_app-text-sm react_unq_staking_app-font-medium ${
                  activeTab === "transfers"
                    ? `react_unq_staking_app-border-b-2 react_unq_staking_app-border-blue-500 react_unq_staking_app-text-blue-500`
                    : `react_unq_staking_app-text-gray-500 hover:react_unq_staking_app-text-gray-700 dark:react_unq_staking_app-text-gray-400 dark:hover:react_unq_staking_app-text-gray-200`
                }`}
                onClick={() => setActiveTab("transfers")}
              >
                Transfers ({transferTransactions.length})
              </button>
            </div>
          </div>

          <div className={`react_unq_staking_app-p-6`}>
            {activeTab === "staking" ? (
              stakingLoading ? (
                <div className={`react_unq_staking_app-flex react_unq_staking_app-justify-center react_unq_staking_app-py-8`}>
                  <div className={`react_unq_staking_app-animate-spin react_unq_staking_app-rounded-full react_unq_staking_app-h-12 react_unq_staking_app-w-12 react_unq_staking_app-border-b-2 react_unq_staking_app-border-blue-500`}></div>
                </div>
              ) : stake.length === 0 ? (
                <div className={`react_unq_staking_app-text-center react_unq_staking_app-py-8 react_unq_staking_app-bg-gray-50 dark:react_unq_staking_app-bg-gray-700 react_unq_staking_app-rounded-lg`}>
                  <p className={`react_unq_staking_app-text-gray-500 dark:react_unq_staking_app-text-gray-400`}>No staking history found</p>
                </div>
              ) : (
                <div className={`react_unq_staking_app-overflow-x-auto`}>
                  <table className={`react_unq_staking_app-min-w-full react_unq_staking_app-bg-white dark:react_unq_staking_app-bg-gray-800 react_unq_staking_app-rounded-lg react_unq_staking_app-overflow-hidden`}>
                    <thead className={`react_unq_staking_app-bg-gray-50 dark:react_unq_staking_app-bg-gray-700`}>
                      <tr>
                        <th className={`react_unq_staking_app-px-6 react_unq_staking_app-py-3 react_unq_staking_app-text-left react_unq_staking_app-text-xs react_unq_staking_app-font-medium react_unq_staking_app-text-gray-500 dark:react_unq_staking_app-text-gray-300 react_unq_staking_app-uppercase react_unq_staking_app-tracking-wider`}>
                          Block
                        </th>
                        <th className={`react_unq_staking_app-px-6 react_unq_staking_app-py-3 react_unq_staking_app-text-left react_unq_staking_app-text-xs react_unq_staking_app-font-medium react_unq_staking_app-text-gray-500 dark:react_unq_staking_app-text-gray-300 react_unq_staking_app-uppercase react_unq_staking_app-tracking-wider`}>
                          Hash
                        </th>
                        <th className={`react_unq_staking_app-px-6 react_unq_staking_app-py-3 react_unq_staking_app-text-left react_unq_staking_app-text-xs react_unq_staking_app-font-medium react_unq_staking_app-text-gray-500 dark:react_unq_staking_app-text-gray-300 react_unq_staking_app-uppercase react_unq_staking_app-tracking-wider`}>
                          Time
                        </th>
                        <th className={`react_unq_staking_app-px-6 react_unq_staking_app-py-3 react_unq_staking_app-text-left react_unq_staking_app-text-xs react_unq_staking_app-font-medium react_unq_staking_app-text-gray-500 dark:react_unq_staking_app-text-gray-300 react_unq_staking_app-uppercase react_unq_staking_app-tracking-wider`}>
                          Status
                        </th>
                        <th className={`react_unq_staking_app-px-6 react_unq_staking_app-py-3 react_unq_staking_app-text-left react_unq_staking_app-text-xs react_unq_staking_app-font-medium react_unq_staking_app-text-gray-500 dark:react_unq_staking_app-text-gray-300 react_unq_staking_app-uppercase react_unq_staking_app-tracking-wider`}>
                          Method
                        </th>
                        <th className={`react_unq_staking_app-px-6 react_unq_staking_app-py-3 react_unq_staking_app-text-right react_unq_staking_app-text-xs react_unq_staking_app-font-medium react_unq_staking_app-text-gray-500 dark:react_unq_staking_app-text-gray-300 react_unq_staking_app-uppercase react_unq_staking_app-tracking-wider`}>
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className={`react_unq_staking_app-divide-y react_unq_staking_app-divide-gray-200 dark:react_unq_staking_app-divide-gray-700`}>
                      {stake.map((tx, index) => (
                        <tr key={index} className={`hover:react_unq_staking_app-bg-gray-50 dark:hover:react_unq_staking_app-bg-gray-700`}>
                          <td className={`react_unq_staking_app-px-6 react_unq_staking_app-py-4 react_unq_staking_app-whitespace-nowrap react_unq_staking_app-text-sm react_unq_staking_app-font-medium react_unq_staking_app-text-gray-900 dark:react_unq_staking_app-text-gray-100`}>
                            {tx.blockNumber}
                          </td>
                          <td className={`react_unq_staking_app-px-6 react_unq_staking_app-py-4 react_unq_staking_app-whitespace-nowrap react_unq_staking_app-text-sm react_unq_staking_app-font-mono`}>
                            <a
                              href={`https://unique.subscan.io/extrinsic/${tx.hash}?tab=event`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`react_unq_staking_app-text-blue-600 hover:react_unq_staking_app-text-blue-800 hover:react_unq_staking_app-underline`}
                            >
                              {formatHash(tx.hash)}
                            </a>
                          </td>
                          <td className={`react_unq_staking_app-px-6 react_unq_staking_app-py-4 react_unq_staking_app-whitespace-nowrap react_unq_staking_app-text-sm react_unq_staking_app-text-gray-600 dark:react_unq_staking_app-text-gray-400`}>
                            {formatDate(tx.createdAt)}
                          </td>
                          <td className={`react_unq_staking_app-px-6 react_unq_staking_app-py-4`}>
                            <span className={`react_unq_staking_app-inline-flex react_unq_staking_app-items-center react_unq_staking_app-rounded-full react_unq_staking_app-bg-green-50 react_unq_staking_app-px-2 react_unq_staking_app-py-1 react_unq_staking_app-text-xs react_unq_staking_app-font-medium react_unq_staking_app-text-green-700 dark:react_unq_staking_app-bg-green-800 dark:react_unq_staking_app-text-green-100`}>
                              Success
                            </span>
                          </td>
                          <td className={`react_unq_staking_app-px-6 react_unq_staking_app-py-4`}>
                            <span className={`react_unq_staking_app-text-sm react_unq_staking_app-text-gray-700 dark:react_unq_staking_app-text-gray-300`}>
                              {tx.section} ({tx.method})
                            </span>
                          </td>
                          <td className={`react_unq_staking_app-px-6 react_unq_staking_app-py-4 react_unq_staking_app-text-right react_unq_staking_app-font-mono react_unq_staking_app-text-sm react_unq_staking_app-text-gray-900 dark:react_unq_staking_app-text-gray-100`}>
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
                <div className={`react_unq_staking_app-flex react_unq_staking_app-justify-center react_unq_staking_app-py-8`}>
                  <div className={`react_unq_staking_app-animate-spin react_unq_staking_app-rounded-full react_unq_staking_app-h-12 react_unq_staking_app-w-12 react_unq_staking_app-border-b-2 react_unq_staking_app-border-blue-500`}></div>
                </div>
              ) : unstake.length === 0 ? (
                <div className={`react_unq_staking_app-text-center react_unq_staking_app-py-8 react_unq_staking_app-bg-gray-50 dark:react_unq_staking_app-bg-gray-700 react_unq_staking_app-rounded-lg`}>
                  <p className={`react_unq_staking_app-text-gray-500 dark:react_unq_staking_app-text-gray-400`}>No unstaking history found</p>
                </div>
              ) : (
                <div className={`react_unq_staking_app-overflow-x-auto`}>
                  <table className={`react_unq_staking_app-min-w-full react_unq_staking_app-bg-white dark:react_unq_staking_app-bg-gray-800 react_unq_staking_app-rounded-lg react_unq_staking_app-overflow-hidden`}>
                    <thead className={`react_unq_staking_app-bg-gray-50 dark:react_unq_staking_app-bg-gray-700`}>
                      <tr>
                        <th className={`react_unq_staking_app-px-6 react_unq_staking_app-py-3 react_unq_staking_app-text-left react_unq_staking_app-text-xs react_unq_staking_app-font-medium react_unq_staking_app-text-gray-500 dark:react_unq_staking_app-text-gray-300 react_unq_staking_app-uppercase react_unq_staking_app-tracking-wider`}>
                          Block
                        </th>
                        <th className={`react_unq_staking_app-px-6 react_unq_staking_app-py-3 react_unq_staking_app-text-left react_unq_staking_app-text-xs react_unq_staking_app-font-medium react_unq_staking_app-text-gray-500 dark:react_unq_staking_app-text-gray-300 react_unq_staking_app-uppercase react_unq_staking_app-tracking-wider`}>
                          Hash
                        </th>
                        <th className={`react_unq_staking_app-px-6 react_unq_staking_app-py-3 react_unq_staking_app-text-left react_unq_staking_app-text-xs react_unq_staking_app-font-medium react_unq_staking_app-text-gray-500 dark:react_unq_staking_app-text-gray-300 react_unq_staking_app-uppercase react_unq_staking_app-tracking-wider`}>
                          Time
                        </th>
                        <th className={`react_unq_staking_app-px-6 react_unq_staking_app-py-3 react_unq_staking_app-text-left react_unq_staking_app-text-xs react_unq_staking_app-font-medium react_unq_staking_app-text-gray-500 dark:react_unq_staking_app-text-gray-300 react_unq_staking_app-uppercase react_unq_staking_app-tracking-wider`}>
                          Status
                        </th>
                        <th className={`react_unq_staking_app-px-6 react_unq_staking_app-py-3 react_unq_staking_app-text-left react_unq_staking_app-text-xs react_unq_staking_app-font-medium react_unq_staking_app-text-gray-500 dark:react_unq_staking_app-text-gray-300 react_unq_staking_app-uppercase react_unq_staking_app-tracking-wider`}>
                          Method
                        </th>
                        <th className={`react_unq_staking_app-px-6 react_unq_staking_app-py-3 react_unq_staking_app-text-right react_unq_staking_app-text-xs react_unq_staking_app-font-medium react_unq_staking_app-text-gray-500 dark:react_unq_staking_app-text-gray-300 react_unq_staking_app-uppercase react_unq_staking_app-tracking-wider`}>
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className={`react_unq_staking_app-divide-y react_unq_staking_app-divide-gray-200 dark:react_unq_staking_app-divide-gray-700`}>
                      {unstake.map((tx, index) => (
                        <tr key={index} className={`hover:react_unq_staking_app-bg-gray-50 dark:hover:react_unq_staking_app-bg-gray-700`}>
                          <td className={`react_unq_staking_app-px-6 react_unq_staking_app-py-4 react_unq_staking_app-whitespace-nowrap react_unq_staking_app-text-sm react_unq_staking_app-font-medium react_unq_staking_app-text-gray-900 dark:react_unq_staking_app-text-gray-100`}>
                            {tx.blockNumber}
                          </td>
                          <td className={`react_unq_staking_app-px-6 react_unq_staking_app-py-4 react_unq_staking_app-whitespace-nowrap react_unq_staking_app-text-sm react_unq_staking_app-font-mono`}>
                            <a
                              href={`https://unique.subscan.io/extrinsic/${tx.hash}?tab=event`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`react_unq_staking_app-text-blue-600 hover:react_unq_staking_app-text-blue-800 hover:react_unq_staking_app-underline`}
                            >
                              {formatHash(tx.hash)}
                            </a>
                          </td>
                          <td className={`react_unq_staking_app-px-6 react_unq_staking_app-py-4 react_unq_staking_app-whitespace-nowrap react_unq_staking_app-text-sm react_unq_staking_app-text-gray-600 dark:react_unq_staking_app-text-gray-400`}>
                            {formatDate(tx.createdAt)}
                          </td>
                          <td className={`react_unq_staking_app-px-6 react_unq_staking_app-py-4`}>
                            <span className={`react_unq_staking_app-inline-flex react_unq_staking_app-items-center react_unq_staking_app-rounded-full react_unq_staking_app-bg-green-50 react_unq_staking_app-px-2 react_unq_staking_app-py-1 react_unq_staking_app-text-xs react_unq_staking_app-font-medium react_unq_staking_app-text-green-700 dark:react_unq_staking_app-bg-green-800 dark:react_unq_staking_app-text-green-100`}>
                              Success
                            </span>
                          </td>
                          <td className={`react_unq_staking_app-px-6 react_unq_staking_app-py-4`}>
                            <span className={`react_unq_staking_app-text-sm react_unq_staking_app-text-gray-700 dark:react_unq_staking_app-text-gray-300`}>
                              {tx.section} ({tx.method})
                            </span>
                          </td>
                          <td className={`react_unq_staking_app-px-6 react_unq_staking_app-py-4 react_unq_staking_app-text-right react_unq_staking_app-font-mono react_unq_staking_app-text-sm react_unq_staking_app-text-gray-900 dark:react_unq_staking_app-text-gray-100`}>
                            {formatAmount(tx.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : transfersLoading ? (
              <div className={`react_unq_staking_app-flex react_unq_staking_app-justify-center react_unq_staking_app-py-8`}>
                <div className={`react_unq_staking_app-animate-spin react_unq_staking_app-rounded-full react_unq_staking_app-h-12 react_unq_staking_app-w-12 react_unq_staking_app-border-b-2 react_unq_staking_app-border-blue-500`}></div>
              </div>
            ) : transferTransactions.length === 0 ? (
              <div className={`react_unq_staking_app-text-center react_unq_staking_app-py-8 react_unq_staking_app-bg-gray-50 dark:react_unq_staking_app-bg-gray-700 react_unq_staking_app-rounded-lg`}>
                <p className={`react_unq_staking_app-text-gray-500 dark:react_unq_staking_app-text-gray-400`}>No transfer transactions found</p>
              </div>
            ) : (
              <div className={`react_unq_staking_app-overflow-x-auto`}>
                <table className={`react_unq_staking_app-min-w-full react_unq_staking_app-bg-white dark:react_unq_staking_app-bg-gray-800 react_unq_staking_app-rounded-lg react_unq_staking_app-overflow-hidden`}>
                  <thead className={`react_unq_staking_app-bg-gray-50 dark:react_unq_staking_app-bg-gray-700`}>
                    <tr>
                      <th className={`react_unq_staking_app-px-6 react_unq_staking_app-py-3 react_unq_staking_app-text-left react_unq_staking_app-text-xs react_unq_staking_app-font-medium react_unq_staking_app-text-gray-500 dark:react_unq_staking_app-text-gray-300 react_unq_staking_app-uppercase react_unq_staking_app-tracking-wider`}>
                        Block
                      </th>
                      <th className={`react_unq_staking_app-px-6 react_unq_staking_app-py-3 react_unq_staking_app-text-left react_unq_staking_app-text-xs react_unq_staking_app-font-medium react_unq_staking_app-text-gray-500 dark:react_unq_staking_app-text-gray-300 react_unq_staking_app-uppercase react_unq_staking_app-tracking-wider`}>
                        Hash
                      </th>
                      <th className={`react_unq_staking_app-px-6 react_unq_staking_app-py-3 react_unq_staking_app-text-left react_unq_staking_app-text-xs react_unq_staking_app-font-medium react_unq_staking_app-text-gray-500 dark:react_unq_staking_app-text-gray-300 react_unq_staking_app-uppercase react_unq_staking_app-tracking-wider`}>
                        Time
                      </th>
                      <th className={`react_unq_staking_app-px-6 react_unq_staking_app-py-3 react_unq_staking_app-text-left react_unq_staking_app-text-xs react_unq_staking_app-font-medium react_unq_staking_app-text-gray-500 dark:react_unq_staking_app-text-gray-300 react_unq_staking_app-uppercase react_unq_staking_app-tracking-wider`}>
                        Status
                      </th>
                      <th className={`react_unq_staking_app-px-6 react_unq_staking_app-py-3 react_unq_staking_app-text-left react_unq_staking_app-text-xs react_unq_staking_app-font-medium react_unq_staking_app-text-gray-500 dark:react_unq_staking_app-text-gray-300 react_unq_staking_app-uppercase react_unq_staking_app-tracking-wider`}>
                        Method
                      </th>
                      <th className={`react_unq_staking_app-px-6 react_unq_staking_app-py-3 react_unq_staking_app-text-right react_unq_staking_app-text-xs react_unq_staking_app-font-medium react_unq_staking_app-text-gray-500 dark:react_unq_staking_app-text-gray-300 react_unq_staking_app-uppercase react_unq_staking_app-tracking-wider`}>
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`react_unq_staking_app-divide-y react_unq_staking_app-divide-gray-200 dark:react_unq_staking_app-divide-gray-700`}>
                    {transferTransactions.map((tx, index) => (
                      <tr key={index} className={`hover:react_unq_staking_app-bg-gray-50 dark:hover:react_unq_staking_app-bg-gray-700`}>
                        <td className={`react_unq_staking_app-px-6 react_unq_staking_app-py-4 react_unq_staking_app-whitespace-nowrap react_unq_staking_app-text-sm react_unq_staking_app-font-medium react_unq_staking_app-text-gray-900 dark:react_unq_staking_app-text-gray-100`}>
                          {tx.blockNumber}
                        </td>
                        <td className={`react_unq_staking_app-px-6 react_unq_staking_app-py-4 react_unq_staking_app-whitespace-nowrap react_unq_staking_app-text-sm react_unq_staking_app-font-mono`}>
                          <a
                            href={`https://unique.subscan.io/extrinsic/${tx.hash}?tab=event`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`react_unq_staking_app-text-blue-600 hover:react_unq_staking_app-text-blue-800 hover:react_unq_staking_app-underline`}
                          >
                            {formatHash(tx.hash)}
                          </a>
                        </td>
                        <td className={`react_unq_staking_app-px-6 react_unq_staking_app-py-4 react_unq_staking_app-whitespace-nowrap react_unq_staking_app-text-sm react_unq_staking_app-text-gray-600 dark:react_unq_staking_app-text-gray-400`}>
                          {formatDate(tx.createdAt)}
                        </td>
                        <td className={`react_unq_staking_app-px-6 react_unq_staking_app-py-4`}>
                          <span className={`react_unq_staking_app-inline-flex react_unq_staking_app-items-center react_unq_staking_app-rounded-full react_unq_staking_app-bg-green-50 react_unq_staking_app-px-2 react_unq_staking_app-py-1 react_unq_staking_app-text-xs react_unq_staking_app-font-medium react_unq_staking_app-text-green-700 dark:react_unq_staking_app-bg-green-800 dark:react_unq_staking_app-text-green-100`}>
                            Success
                          </span>
                        </td>
                        <td className={`react_unq_staking_app-px-6 react_unq_staking_app-py-4`}>
                          <span className={`react_unq_staking_app-text-sm react_unq_staking_app-text-gray-700 dark:react_unq_staking_app-text-gray-300`}>
                            {tx.section} ({tx.method})
                          </span>
                        </td>
                        <td className={`react_unq_staking_app-px-6 react_unq_staking_app-py-4 react_unq_staking_app-text-right react_unq_staking_app-font-mono react_unq_staking_app-text-sm react_unq_staking_app-text-gray-900 dark:react_unq_staking_app-text-gray-100`}>
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