"use client"

import { useState, useMemo } from "react"
import { useWallet } from "@/context/wallet-context"
import WalletSelection from "./wallet-selection"

export function WalletButton() {
    const { connected, wallet } = useWallet()
    const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)

    const selectedWalletComponent = useMemo(() => {
        if (!wallet) return null
        return (
            <div className="flex items-center">
                <img
                    src={wallet.logo.src}
                    alt={wallet.logo.alt}
                    className="w-5 h-5 rounded-full"
                />
                <span className="ml-2 text-sm font-medium">
          {wallet.title || wallet.extensionName || "Unknown Wallet"}
        </span>
            </div>
        )
    }, [wallet])

    return (
        <>
            <button
                onClick={() => setIsWalletModalOpen(true)}
                className="inline-flex items-center px-4 py-2 rounded-md text-sm sm:text-base font-medium border bg-blue-500 text-white border-blue-500 hover:bg-blue-600 focus:ring-2 focus:ring-blue-300 transition"
            >
                {connected ? selectedWalletComponent : "Connect Wallet"}
            </button>

            {isWalletModalOpen && <WalletSelection onClose={() => setIsWalletModalOpen(false)} />}
        </>
    )
}