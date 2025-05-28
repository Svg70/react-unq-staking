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
      <header className={cn("st-h-[0px] st-sticky st-top-0 st-shadow-sm st-h-[0px]")}>
        <div className={cn("st-max-w-7xl st-mx-auto st-px-4 sm:st-px-6 lg:st-px-8")}>
          <div className={cn("st-flex st-justify-end st-h-16 st-items-center")}>
            <div className={cn("sm:st-flex st-items-center st-space-x-4 st-ml-auto")}>
              {!connected && (
                  <button
                      onClick={() => setIsWalletModalOpen(true)}
                      className={cn(
                          "st-px-6 st-py-3 st-rounded-md st-text-lg st-font-medium st-border st-bg-blue-500 st-text-white st-border-blue-500"
                      )}
                  >
                    Connect Wallet
                  </button>
              )}

              {connected && (
                  <div className={cn("st-relative")} ref={dropdownRef}>
                    <button
                        onClick={() => setIsWalletDropdownOpen(v => !v)}
                        className={cn(
                            "st-px-3 st-py-2 st-bg-gray-100 dark:st-bg-gray-700 st-text-gray-800 dark:st-text-gray-200 st-rounded-md"
                        )}
                    >
                      {walletAddress?.slice(0, 6)}…{walletAddress?.slice(-6)}
                    </button>
                    {isWalletDropdownOpen && (
                        <div
                            className={cn(
                                "st-absolute st-right-0 st-mt-2 st-w-48 st-shadow-lg st-rounded-md st-z-50",
                                resolvedTheme === "dark" ? "st-bg-blue-600" : "st-bg-blue-500"
                            )}
                        >
                          <button
                              onClick={() => {
                                setIsWalletModalOpen(true)
                                setIsWalletDropdownOpen(false)
                              }}
                              className={cn("st-w-full st-text-left st-px-4 st-py-2 st-hover:bg-opacity-90 st-text-white")}
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
