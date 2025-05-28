"use client"

import { useState } from "react"
import WalletSelection from "@/components/wallet-selection"
import StakingForm from "@/components/staking-form"
import UnstakingForm from "@/components/unstaking-form"
import FAQ from "@/components/faq"
import ProgressModal from "@/components/modals/progress-modal"
import StatusModal from "@/components/modals/status-modal"
import SuccessModal from "@/components/modals/success-modal"
import Header from "@/components/header"
import StakingHistory from "@/components/staking-history"
import { TabProvider, useTab } from "@/context/tab-context"
import { cn } from "../lib/utils"

function StakingTabs() {
  const { activeTab, setActiveTab } = useTab()
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [showProgressModal, setShowProgressModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showUnstakingSuccessModal, setShowUnstakingSuccessModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [transactionHash, setTransactionHash] = useState("")

  const extractTransactionHash = (result: any): string => {
    if (!result) return ""
    if (typeof result === "string") return result
    if (typeof result === "object" && result !== null && typeof result.hash === "string") {
      return result.hash
    }
    console.warn("Could not extract transaction hash from result:", result)
    return ""
  }

  return (
    <>
      <section className={cn("st-py-16 st-bg-white dark:st-bg-gray-800")}>
        <div className={cn("st-container st-mx-auto st-px-4")}>
          <div className={cn("st-max-w-2xl st-mx-auto st-bg-white dark:st-bg-gray-700 st-rounded-lg st-shadow-xl st-ring-1 st-ring-black/5 st-p-8")}>
            <div className={cn("st-mb-8")}>
              <div className={cn("st-flex st-justify-center st-mb-6")}>
                <div className={cn("st-grid st-grid-cols-2 st-w-full st-max-w-md st-gap-4")}>
                  <button
                      onClick={() => setActiveTab("stake")}
                      className={cn(
                          "st-px-6 st-py-3 st-rounded-md st-text-lg st-font-medium st-border",
                          activeTab === "stake"
                              ? "st-bg-blue-500 st-text-white st-border-blue-500"
                              : "st-bg-white st-text-gray-700 st-border-gray-300 dark:st-bg-gray-800 dark:st-text-gray-200 dark:st-border-gray-600"
                      )}
                  >
                    Stake
                  </button>
                  <button
                      onClick={() => setActiveTab("unstake")}
                      className={cn(
                          "st-px-6 st-py-3 st-rounded-md st-text-lg st-font-medium st-border",
                          activeTab === "unstake"
                              ? "st-bg-blue-500 st-text-white st-border-blue-500"
                              : "st-bg-white st-text-gray-700 st-border-gray-300 dark:st-bg-gray-800 dark:st-text-gray-200 dark:st-border-gray-600"
                      )}
                  >
                    Unstake
                  </button>
                </div>
              </div>

              {activeTab === "stake" ? (
                  <StakingForm
                      key="staking-form"
                      onConnectWallet={() => setShowWalletModal(true)}
                      onStartStaking={() => setShowProgressModal(true)}
                      onStakingSuccess={(result) => {
                        setShowProgressModal(false)
                        const hash = extractTransactionHash(result)
                        setTransactionHash(hash)
                        setShowSuccessModal(true)
                      }}
                      onStakingError={(error) => {
                        setShowProgressModal(false)
                        setErrorMessage(error)
                        setShowStatusModal(true)
                      }}
                  />
              ) : (
                  <UnstakingForm
                      key="unstaking-form"
                      onConnectWallet={() => setShowWalletModal(true)}
                      onStartUnstaking={() => setShowProgressModal(true)}
                      onUnstakingSuccess={(result) => {
                        setShowProgressModal(false)
                        const hash = extractTransactionHash(result)
                        setTransactionHash(hash)
                        setShowUnstakingSuccessModal(true)
                      }}
                      onUnstakingError={(error) => {
                        setShowProgressModal(false)
                        setErrorMessage(error)
                        setShowStatusModal(true)
                      }}
                  />
              )}
            </div>
          </div>
        </div>
      </section>

      <StakingHistory />
      <FAQ />

      {showWalletModal && <WalletSelection onClose={() => setShowWalletModal(false)} />}
      {showProgressModal && <ProgressModal onClose={() => setShowProgressModal(false)} />}
      {showStatusModal && (
        <StatusModal errorMessage={errorMessage} onClose={() => setShowStatusModal(false)} />
      )}
      {showSuccessModal && (
        <SuccessModal
          transactionHash={transactionHash}
          onClose={() => setShowSuccessModal(false)}
          isUnstaking={false}
        />
      )}
      {showUnstakingSuccessModal && (
        <SuccessModal
          transactionHash={transactionHash}
          onClose={() => setShowUnstakingSuccessModal(false)}
          isUnstaking={true}
        />
      )}
    </>
  )
}

export default function StakingPage() {
  return (
    <div className={cn("st-flex st-flex-col st-min-h-screen")}>
      <Header />
      <main className={cn("st-flex-grow")}>
        <section className={cn("st-bg-gray-100 dark:st-bg-gray-900 st-py-16")}>
          <div className={cn("st-container st-mx-auto st-px-4 st-text-center")}>
            <h1 className={cn("st-text-4xl md:st-text-5xl st-font-bold st-mb-4")}>
              <span className={cn("st-text-gray-900 dark:st-text-white")}>UNIQUE STAKING HUB</span>
              <br />
              <span className={cn("st-text-blue-500")}>IS AVAILABLE</span>
            </h1>
            <p className={cn("st-text-xl")}>
              Earn 18% APY staking your UNQ and QTZ tokens
            </p>
          </div>
        </section>

        <TabProvider>
          <StakingTabs />
        </TabProvider>
      </main>

      {/* <Footer /> */}
    </div>
  )
}
