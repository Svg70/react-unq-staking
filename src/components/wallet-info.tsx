"use client"

import { useState } from "react"
import { useWallet } from "@/context/wallet-context"
import BalanceInfo from "@/components/balance-info"
import { cn } from "../lib/utils"

interface WalletInfoProps {
  activeTab?: "stake" | "unstake"
}

export default function WalletInfo({ activeTab = "stake" }: WalletInfoProps) {
  const { walletAddress, accounts, selectAccount, isConnecting } = useWallet()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const handleSelectAccount = async (address: string) => {
    const account = accounts.find((acc) => acc.address === address)
    if (account) {
      await selectAccount(account)
      setIsDropdownOpen(false)
    }
  }

  return (
      <div className={cn("st-space-y-4")}>
        {isConnecting && (
            <div className={cn("st-flex st-items-center st-justify-center st-p-4")}>
              <div className={cn("st-animate-spin st-rounded-full st-h-6 st-w-6 st-border-b-2 st-border-orange-500 st-mr-2")} />
              <span className={cn("st-text-gray-600 dark:st-text-gray-300")}>Connecting wallet...</span>
            </div>
        )}

        <div>
          <div className={cn("st-flex st-items-center st-mb-2")}>
            <div className={cn("st-flex st-items-center st-text-orange-500")}>
              <svg className={cn("st-w-6 st-h-6 st-mr-2")} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
              </svg>
              <span className={cn("st-font-medium")}>Current account</span>
            </div>
          </div>

          <div className={cn("st-relative")}>
            <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={cn(
                    "st-w-full st-flex st-items-center st-justify-between st-px-4 st-py-3 st-border st-border-gray-300 st-rounded-md st-bg-white dark:st-bg-gray-700"
                )}
            >
            <span className={cn("st-text-gray-500 dark:st-text-gray-200")}>
              {walletAddress}
            </span>
              <svg
                  className={cn(
                      "st-w-5 st-h-5 st-transition-transform",
                      isDropdownOpen && "st-rotate-180"
                  )}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isDropdownOpen && accounts.length > 0 && (
                <div className={cn("st-absolute st-z-10 st-w-full st-mt-1 st-bg-white dark:st-bg-gray-700 st-border st-border-gray-300 dark:st-border-gray-600 st-rounded-md st-shadow-lg")}>
                  <div className={cn("st-p-2")}>
                    {accounts.map((account) => (
                        <div
                            key={account.address}
                            onClick={() => handleSelectAccount(account.address)}
                            className={cn("st-p-2 st-hover:bg-gray-100 dark:st-hover:bg-gray-600 st-rounded st-cursor-pointer")}
                        >
                          <div className={cn("st-flex st-items-center")}>
                            <span className={cn("st-font-medium st-mr-2 st-text-gray-700 dark:st-text-gray-300")}>{account.name || "Account"}</span>
                            <span className={cn("st-text-gray-500 dark:st-text-gray-400")}>{account.address.substring(0, 6)}...{account.address.slice(-6)}</span>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>
            )}
          </div>
        </div>

        <BalanceInfo activeTab={activeTab} />
      </div>
  )
}
