"use client"

import { useState, useEffect, useRef } from "react"

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

        <div>

            <div className="flex items-center">
              {!connected && (
                <div
                  onClick={() => setIsWalletModalOpen(true)}
                  className="px-6 py-[4px] rounded-[14px] text-lg font-medium border bg-blue-500 text-white border-blue-500 cursor-pointer"
                >
                  connect wallet
                </div>
              )}

              {connected && (
                <div className="relative" ref={dropdownRef}>
                  <div
                    onClick={() => setIsWalletDropdownOpen(v => !v)}
                    className="px-6 py-[4px] rounded-[14px] text-lg font-medium border bg-blue-500 text-white border-blue-500 cursor-pointer"
                  >
                    {walletAddress?.slice(0, 6)}…{walletAddress?.slice(-6)}
                  </div>
                  {isWalletDropdownOpen && (
                    <div
                      className={`absolute right-0 mt-2 w-[200px] h-[70px] shadow-lg rounded-md z-50 flex justify-center items-center ${
                        resolvedTheme === "dark" ? "bg-gray-100" : "bg-blue-900"
                      }`}
                    >
                      <div
                        onClick={() => {
                          setIsWalletModalOpen(true)
                          setIsWalletDropdownOpen(false)
                        }}
                        className="w-[180px] h-[30px] bg-blue-500 text-gray-200 rounded-md flex justify-center items-center hover:opacity-80 transition-colors cursor-pointer"
                      >
                        Switch Account
                      </div>
                    </div>

                  )}
                </div>
              )}

              {/* <button
                onClick={toggleTheme}
                className="p-2 rounded-md text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {mounted && (resolvedTheme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />)}
              </button> */}
            </div>

        </div>
      {isWalletModalOpen && <WalletSelection onClose={() => setIsWalletModalOpen(false)} />}
    </>
  )
}
