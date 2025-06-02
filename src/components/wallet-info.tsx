"use client"

import { useState } from "react"
import { useWallet } from "@/context/wallet-context"
import BalanceInfo from "@/components/balance-info"
import CopyStroke from "@/assets/icons/CopyStroke.tsx";
import {useCopy} from "@/hooks/use-copy.ts";
import {NotificationModal} from "@/components/modals/notification-modal.tsx";

interface WalletInfoProps {
  activeTab?: "stake" | "unstake"
}

export default function WalletInfo({ activeTab = "stake" }: WalletInfoProps) {
  const { walletAddress, accounts, selectAccount, isConnecting } = useWallet()
  const { handleCopy, showNotification } = useCopy()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const handleSelectAccount = async (address: string) => {
    const account = accounts.find((acc) => acc.address === address)
    if (account) {
      await selectAccount(account)
      setIsDropdownOpen(false)
    }
  }

  return (
    <div className="space-y-4">
      {isConnecting && (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mr-2"></div>
          <span className="text-gray-600 dark:text-gray-300">Connecting wallet...</span>
        </div>
      )}
      <div>
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            <span className="text-lg font-normal text-gray-600 dark:text-gray-300">Current account</span>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-md bg-white"
          >
            <div className="flex items-center overflow-hidden">
              <div
                  onClick={(e) => {
                    e.stopPropagation()
                    if (walletAddress) {
                      handleCopy(walletAddress)
                    }
                  }}
                  className="mr-2"
              >
                <CopyStroke className="w-6 h-6 text-gray-500 hover:text-gray-700" />
              </div>
              {showNotification && <NotificationModal />}
              <span className="text-sm text-gray-500">{walletAddress}</span>
            </div>
            <svg
              className={`w-5 h-5 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isDropdownOpen && accounts.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
              <div className="p-2">
                {accounts.map((account) => (
                  <div
                    key={account.address}
                    className="p-2 hover:bg-gray-100 rounded cursor-pointer"
                    onClick={() => handleSelectAccount(account.address)}
                  >
                    <div className="flex items-center">
                      <span className="font-medium mr-2 text-gray-700 dark:text-gray-300">
                        {account.name || "Account"}
                      </span>
                      <span className="text-gray-500">
                        {account.address.substring(0, 6)}...{account.address.substring(account.address.length - 6)}
                      </span>
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
