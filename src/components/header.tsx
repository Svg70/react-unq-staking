"use client"

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { useWallet } from "@/context/wallet-context"
import WalletSelection from "./wallet-selection"

export default function Header() {
  const { connected, walletAddress } = useWallet()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const [isWalletDropdownOpen, setIsWalletDropdownOpen] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsWalletDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    const nextTheme = resolvedTheme === "dark" ? "light" : "dark"
    setTheme(nextTheme)
  }

  return (
    <>
      <header className={cn("h-[0px] sticky top-0 shadow-sm h-[0px]")}>
        <div className={cn("max-w-7xl mx-auto px-4 sm:px-6 lg:px-8")}>
          <div className={cn("flex justify-end h-16 items-center")}>
            <div className={cn("sm:flex items-center space-x-4 ml-auto")}>
              {!connected && (
                <button
                  onClick={() => setIsWalletModalOpen(true)}
                  className={cn(
                    "px-6 py-3 rounded-md text-lg font-medium border bg-blue-500 text-white border-blue-500"
                  )}
                >
                  Connect Wallet
                </button>
              )}

              {connected && (
                <div className={cn("relative")} ref={dropdownRef}>
                  <button
                    onClick={() => setIsWalletDropdownOpen(v => !v)}
                    className={cn(
                      "px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md"
                    )}
                  >
                    {walletAddress?.slice(0, 6)}…{walletAddress?.slice(-6)}
                  </button>
                  {isWalletDropdownOpen && (
                    <div
                      className={cn(
                        "absolute right-0 mt-2 w-48 shadow-lg rounded-md z-50",
                        resolvedTheme === "dark" ? "bg-blue-600" : "bg-blue-500"
                      )}
                    >
                      <button
                        onClick={() => {
                          setIsWalletModalOpen(true)
                          setIsWalletDropdownOpen(false)
                        }}
                        className={cn("w-full text-left px-4 py-2 hover:bg-opacity-90 text-white")}
                      >
                        Connect New Wallet
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {isWalletModalOpen && <WalletSelection onClose={() => setIsWalletModalOpen(false)} />}
    </>
  )
}
