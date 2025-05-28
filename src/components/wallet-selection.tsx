
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
      <div className="st-fixed st-inset-0 st-bg-black/30 st-backdrop-blur-sm st-flex st-items-center st-justify-center st-z-50 st-p-4">
        <div className="st-bg-white dark:st-bg-gray-800 st-rounded-lg st-shadow-xl st-p-6 sm:st-p-8 st-max-w-md st-w-full st-relative st-flex st-flex-col st-max-h-[90vh] st-overflow-hidden">
          <button onClick={onClose} className="st-absolute st-top-3 st-right-3 st-p-1.5 st-rounded-full st-text-gray-400 dark:st-hover:text-gray-300 st-hover:text-gray-600 st-hover:bg-gray-100 dark:st-hover:bg-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="st-h-5 st-w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {error && <div className="st-mb-4 st-p-3 st-bg-red-50 dark:st-bg-red-900/30 st-border st-border-red-300 dark:st-border-red-700 st-text-red-700 dark:st-text-red-300 st-rounded st-text-sm">{error}</div>}
          {isConnecting && (
              <div className="st-fixed st-inset-0 st-bg-black/30 st-backdrop-blur-sm st-flex st-items-center st-justify-center st-z-50">
                <div className="st-bg-white dark:st-bg-gray-800 st-rounded-lg st-shadow-xl st-p-8 st-max-w-md st-w-full st-text-center">
                  <div className="st-animate-spin st-rounded-full st-h-12 st-w-12 st-border-b-2 st-border-orange-500 st-mx-auto st-mb-4"></div>
                  <h3 className="st-text-xl st-font-semibold st-mb-2 st-text-gray-900 dark:st-text-white">Connecting Wallet</h3>
                  <p className="st-text-gray-600 dark:st-text-gray-300">Please wait while we connect to your wallet...</p>
                </div>
              </div>
          )}
          <div className="st-overflow-y-auto st-flex-1 st-pr-1 st-custom-scrollbar">
            {step === "wallets" ? (
                <>
                  <h3 className="st-text-xl st-font-semibold st-mb-6 st-text-center st-text-gray-900 dark:st-text-white">Connect Wallet</h3>
                  {visibleInstalled.length === 0 && visibleNotInstalled.length === 0 ? (
                      <div className="st-text-center st-py-4"><p className="st-text-gray-500 dark:st-text-gray-400">No wallets to display.</p></div>
                  ) : (
                      <>
                        <div className="st-space-y-3">
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
                                    className="st-w-full st-flex st-items-center st-p-3 st-border st-border-gray-300 dark:st-border-gray-600 st-rounded-lg st-hover:bg-gray-50 dark:st-hover:bg-gray-700 st-transition"
                                >
                                  <img src={w.logo.src} alt={w.logo.alt} className="st-w-7 st-h-7 st-mr-4" />
                                  <span className="st-flex-1 st-font-medium st-text-gray-700 dark:st-text-gray-200">{w.title}</span>
                                  <svg xmlns="http://www.w3.org/2000/svg" className="st-h-5 st-w-5 st-text-gray-400 dark:st-text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                  </svg>
                                </button>
                            )
                          })}
                        </div>
                        {visibleNotInstalled.length > 0 && (
                            <>
                              <p className="st-mt-4 st-mb-2 st-text-xs st-text-gray-500 dark:st-text-gray-400 st-text-center">Other wallets (not installed):</p>
                              <div className="st-space-y-3">
                                {visibleNotInstalled.map(w => (
                                    <button
                                        key={w.extensionName}
                                        onClick={() => window.open(w.installUrl, "_blank")}
                                        className="st-w-full st-flex st-items-center st-p-3 st-border st-border-gray-300 dark:st-border-gray-600 st-rounded-lg st-hover:bg-gray-50 dark:st-hover:bg-gray-700 st-opacity-80 st-transition"
                                    >
                                      <img src={w.logo.src} alt={w.logo.alt} className="st-w-7 st-h-7 st-mr-4" />
                                      <span className="st-flex-1 st-font-medium st-text-gray-700 dark:st-text-gray-200">{w.title}</span>
                                      <span className="st-text-xs st-text-blue-500 dark:st-text-blue-400">Install</span>
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
                  <div className="st-flex st-items-center st-mb-6">
                    <button onClick={() => { setStep("wallets"); setError(null) }} className="st-p-1.5 st-rounded-full st-text-gray-500 dark:st-text-gray-400 st-hover:bg-gray-100 dark:st-hover:bg-gray-700 st-mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="st-h-5 st-w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <h3 className="st-text-xl st-font-semibold st-text-gray-900 dark:st-text-white">Select Account</h3>
                  </div>
                  <div className="st-space-y-2 st-max-h-72 st-overflow-y-auto st-pr-1 st-custom-scrollbar">
                    {accounts.length === 0 && !error ? (
                        <div className="st-text-center st-py-4">
                          {chosenWallet && <div className="st-animate-spin st-rounded-full st-h-6 st-w-6 st-border-b-2 st-border-blue-500 st-mx-auto st-mb-2"></div>}
                          <p className="st-text-gray-500 dark:st-text-gray-400">
                            {chosenWallet ? `Looking for accounts in ${chosenWallet.title}...` : "No accounts available."}
                          </p>
                          {chosenWallet && <p className="st-text-xs st-text-gray-400 dark:st-text-gray-500 st-mt-1">Ensure you have accounts in the extension.</p>}
                        </div>
                    ) : (
                        accounts.map(acct => (
                            <button
                                key={acct.address}
                                onClick={() => { selectAccount(acct); onClose() }}
                                className="st-w-full st-flex st-items-center st-p-3 st-border st-border-gray-300 dark:st-border-gray-600 st-rounded-lg st-hover:bg-gray-100 dark:st-hover:bg-gray-700 st-transition"
                            >
                              <div className="st-w-7 st-h-7 st-bg-gradient-to-br st-from-blue-400 st-to-indigo-500 st-rounded-full st-flex st-items-center st-justify-center st-text-white st-text-sm st-font-semibold st-mr-4 st-shadow">
                                {(acct.name || "X").charAt(0).toUpperCase()}
                              </div>
                              <div className="st-flex-1 st-overflow-hidden">
                                <div className="st-font-medium st-text-sm st-text-gray-800 dark:st-text-gray-100 st-truncate">{acct.name || "Unnamed Account"}</div>
                                <div className="st-text-xs st-text-gray-500 dark:st-text-gray-400 st-truncate">{acct.address}</div>
                              </div>
                              <svg xmlns="http://www.w3.org/2000/svg" className="st-h-5 st-w-5 st-text-gray-400 dark:st-text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

