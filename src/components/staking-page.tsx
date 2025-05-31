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
import Footer from "@/components/footer"
import StakingHistory from "@/components/staking-history"
import { TabProvider, useTab } from "@/context/tab-context"

function StakingTabs() {
  const { activeTab, setActiveTab } = useTab()
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [showProgressModal, setShowProgressModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showUnstakingSuccessModal, setShowUnstakingSuccessModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [transactionHash, setTransactionHash] = useState("")

  // Helper function to extract hash from transaction result
  const extractTransactionHash = (result: any): string => {
    if (!result) return ""

    // If result is a string, return it directly
    if (typeof result === "string") return result

    // If result is an object with a hash property, return that
    if (typeof result === "object" && result !== null) {
      if (typeof result.hash === "string") return result.hash
    }

    // If we couldn't extract a hash, return empty string
    console.warn("Could not extract transaction hash from result:", result)
    return ""
  }

  return (
    <>
      {/* Staking Section */}
      <section className="py-16 bg-gray-100 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white dark:bg-gray-700 rounded-lg shadow-xl ring-1 ring-black/5 p-8">
            <div className="mb-8">
              {/* Tabs */}
              <div className="flex justify-center mb-6">
                <div className="flex justify-center w-full max-w-md gap-4">
                  <button
                    className={`w-[160px] h-[58px] py-3 rounded-[12px] text-lg font-semibold border ${
                      activeTab === "stake"
                        ? "text-blue-500 border-blue-500"
                        : "bg-white text-gray-300 border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600"
                    }`}
                    onClick={() => setActiveTab("stake")}
                  >
                    Stake
                  </button>
                  <button
                    className={`w-[160px] h-[58px]  py-3 rounded-[12px] text-lg font-semibold border ${
                      activeTab === "unstake"
                        ? "text-blue-500 border-blue-500"
                        : "bg-white text-gray-300 border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600"
                    }`}
                    onClick={() => setActiveTab("unstake")}
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

      {/* Staking History Section */}
      <StakingHistory />

      {/* FAQ Section */}
      <FAQ />

      {/* Modals */}
      {showWalletModal && <WalletSelection onClose={() => setShowWalletModal(false)} />}

      {showProgressModal && <ProgressModal onClose={() => setShowProgressModal(false)} />}

      {showStatusModal && <StatusModal errorMessage={errorMessage} onClose={() => setShowStatusModal(false)} />}

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
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-gray-100 dark:bg-gray-900">
        <section className="pb-16 pt-[110px]">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-raleway text-[52px] md:text-5xl font-black mb-4">
              <span className="text-gray-900 dark:text-white">UNIQUE STAKING HUB</span>
              <br />
              <span className="text-blue-500">IS AVAILABLE</span>
            </h1>
            <p className="text-lg font-normal">Earn 18% APY staking your UNQ and QTZ tokens</p>
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
