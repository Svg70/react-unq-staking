
"use client"
import { useEffect, useState } from "react"
import { getWallets, type Wallet } from "@talismn/connect-wallets"
import { useWallet } from "@/context/wallet-context"

declare global {
  interface Window {
    walletExtension?: { isNovaWallet: boolean }
  }
}

export default function WalletSelection({ onClose }: { onClose(): void }) {
  const { setWallet, setAccounts, selectAccount, accounts, wallet: currentWallet, isConnecting } = useWallet()
  const [step, setStep] = useState<"wallets" | "accounts">("wallets")
  const [error, setError] = useState<string | null>(null)
  const [allWallets, setAllWallets] = useState<Wallet[]>([])
  const [chosenWallet, setChosenWallet] = useState<Wallet | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(/Mobi|Android|iPhone|iPad|iPod/.test(navigator.userAgent))
  }, [])

  useEffect(() => {
    try {
      setAllWallets(getWallets() || [])
    } catch {
      setError("Error detecting wallets.")
    }
  }, [])

  useEffect(() => {
    if (!chosenWallet) return
    let mounted = true
    let unsub: (() => void) | undefined
    if (chosenWallet.extensionName === currentWallet?.extensionName && accounts.length > 0) {
      if (step === "wallets") setStep("accounts")
      return
    }
    const enableFn = chosenWallet.enable as (dapp: string) => Promise<void>
    const subFn = chosenWallet.subscribeAccounts as (cb: (raw: any[]) => void) => () => void
    enableFn("Unique Staking")
      .then(() => {
        if (!mounted) return
        if (currentWallet?.extensionName !== chosenWallet.extensionName) {
          setWallet(chosenWallet)
        }
        unsub = subFn(raw => {
          if (!mounted) return
          setAccounts(raw)
          if (step !== "accounts") setStep("accounts")
        })
      })
      .catch(() => {
        if (!mounted) return
        setError(`Failed to connect to ${chosenWallet.title}.`)
        setChosenWallet(null)
        if (step !== "wallets") setStep("wallets")
      })
    return () => {
      mounted = false
      if (typeof unsub === "function") unsub()
    }
  }, [chosenWallet, currentWallet, accounts, step, setWallet, setAccounts])

  const installed = allWallets.filter(w => w.installed)
  const notInstalled = allWallets.filter(w => !w.installed)
  const visibleInstalled = installed.filter(w => (isMobile ? w.title === "Nova Wallet" : w.title !== "Nova Wallet"))
  const visibleNotInstalled = notInstalled.filter(w => (isMobile ? w.title === "Nova Wallet" : w.title !== "Nova Wallet"))

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 sm:p-8 max-w-md w-full relative flex flex-col max-h-[90vh] overflow-hidden">
        <button onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {error && <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 rounded text-sm">{error}</div>}
        {isConnecting && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Connecting Wallet</h3>
              <p className="text-gray-600 dark:text-gray-300">Please wait while we connect to your wallet...</p>
            </div>
          </div>
        )}
        <div className="overflow-y-auto flex-1 pr-1 custom-scrollbar">
          {step === "wallets" ? (
            <>
              <h3 className="text-xl font-semibold mb-6 text-center text-gray-900 dark:text-white">Connect Wallet</h3>
              {visibleInstalled.length === 0 && visibleNotInstalled.length === 0 ? (
                <div className="text-center py-4"><p className="text-gray-500 dark:text-gray-400">No wallets to display.</p></div>
              ) : (
                <>
                  <div className="space-y-3">
                    {visibleInstalled.map((w, i) => {
                      const isNova = w.title === "Nova Wallet"
                      return (
                        <button
                          key={w.extensionName + i}
                          onClick={() => {
                            if (isNova) {
                              if (!window.walletExtension?.isNovaWallet) {
                                window.location.href = `https://app.novawallet.io/open/dapp?url=${process.env.REACT_APP_PUBLIC_SITE_URL}`
                                return
                              }
                              const fallback = installed.find(x => x.title === "Polkadot.js")
                              if (fallback) setChosenWallet(fallback)
                            } else {
                              setChosenWallet(w)
                            }
                          }}
                          className="w-full flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                        >
                          <img src={w.logo.src} alt={w.logo.alt} className="w-7 h-7 mr-4" />
                          <span className="flex-1 font-medium text-gray-700 dark:text-gray-200">{w.title}</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      )
                    })}
                  </div>
                  {visibleNotInstalled.length > 0 && (
                    <>
                      <p className="mt-4 mb-2 text-xs text-gray-500 dark:text-gray-400 text-center">Other wallets (not installed):</p>
                      <div className="space-y-3">
                        {visibleNotInstalled.map(w => (
                          <button
                            key={w.extensionName}
                            onClick={() => window.open(w.installUrl, "_blank")}
                            className="w-full flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 opacity-80 transition"
                          >
                            <img src={w.logo.src} alt={w.logo.alt} className="w-7 h-7 mr-4" />
                            <span className="flex-1 font-medium text-gray-700 dark:text-gray-200">{w.title}</span>
                            <span className="text-xs text-blue-500 dark:text-blue-400">Install</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center mb-6">
                <button onClick={() => { setStep("wallets"); setError(null) }} className="p-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Select Account</h3>
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                {accounts.length === 0 && !error ? (
                  <div className="text-center py-4">
                    {chosenWallet && <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>}
                    <p className="text-gray-500 dark:text-gray-400">
                      {chosenWallet ? `Looking for accounts in ${chosenWallet.title}...` : "No accounts available."}
                    </p>
                    {chosenWallet && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Ensure you have accounts in the extension.</p>}
                  </div>
                ) : (
                  accounts.map(acct => (
                    <button
                      key={acct.address}
                      onClick={() => { selectAccount(acct); onClose() }}
                      className="w-full flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                      <div className="w-7 h-7 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-semibold mr-4 shadow">
                        {(acct.name || "X").charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="font-medium text-sm text-gray-800 dark:text-gray-100 truncate">{acct.name || "Unnamed Account"}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{acct.address}</div>
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

