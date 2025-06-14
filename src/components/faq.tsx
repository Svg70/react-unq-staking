"use client"

import { useState } from "react"
import { cn } from "../lib/utils"

interface FAQItem {
  id: string
  question: string
  answer: string
}

export default function FAQ() {
  const [openItem, setOpenItem] = useState<string | null>(null)

  const faqItems: FAQItem[] = [
    {
      id: "what-is-unique-staking",
      question: "What is Unique Staking?",
      answer:
        "Unique Staking Hub enables users to stake their ecosystem tokens to support the development of the Unique Network blockchain and as a mechanism to grow capital while sponsoring dApp transactions on the Unique Network.",
    },
    {
      id: "benefits",
      question: "What are the benefits of Unique Staking?",
      answer:
        "Users can stake their tokens and earn an Annual Percentage Yield (APY) while contributing to the health of the Unique Network blockchain. This yield is generated by inflation and taken from the Treasury.",
    },
    {
      id: "receive-tokens",
      question: "When will I receive my tokens after unstaking?",
      answer:
        "Tokens can be unstaked anytime. However, there is a one-week waiting period for tokens to arrive in the user's wallet.",
    },
    {
      id: "future-plans",
      question: "What are the future plans for Unique Staking?",
      answer:
        "AppPromotion features will be integrated into Unique Staking. We plan on enabling UNQ/QTZ owners to influence how the apps are sponsored and earn even more rewards as promoted dApps become successful.",
    },
    {
      id: "metamask",
      question: "Can I stake UNQ & QTZ tokens with MetaMask?",
      answer:
        "Currently, users can stake their tokens only using Substrate wallets, but in future releases, we'll add MetaMask staking functionality.",
    },
    {
      id: "stake-times",
      question: "How many times can I stake my tokens?",
      answer:
        "Users can stake 10 times from one wallet. All staked tokens must be unstaked simultaneously. However, there is a one-week waiting period for tokens to arrive in the user's wallet.",
    },
    {
      id: "vesting",
      question: "Can I stake coins locked in vesting?",
      answer:
        "You can stake coins from both transferable and locked balances. When staking coins, staking always starts from balances that are already locked (vesting, democracy, election). For example: you have 1000 coins (500 transferable and 500 vested). If you want to stake 400 coins, they will be staked from the vested balance because it's already locked. However, if you want to stake 600 coins, 500 coins will be staked from the vested balance and the remaining 100 coins from the transferable balance. The system automatically prioritizes the locked funds. This leads to a more efficient and secure staking experience while maximizing the earning potential of your entire coin balance.",
    },
  ]

  const toggleItem = (id: string) => {
    setOpenItem(openItem === id ? null : id)
  }

  return (
      <section id="FAQ" className={cn("st-py-16 st-bg-gray-50 dark:st-bg-gray-900")}>
        <div className={cn("st-container st-mx-auto st-px-4")}>
          <header className={cn("st-mb-12 st-text-center")}>
            <h2 className={cn("st-text-3xl st-font-bold")}>FAQ</h2>
          </header>

          <div className={cn("st-max-w-3xl st-mx-auto")}>
            {faqItems.map((item) => (
                <div
                    key={item.id}
                    className={cn(
                        "st-mb-4",
                        "st-border",
                        "st-border-gray-200 dark:st-border-gray-700",
                        "st-rounded-lg",
                        "st-overflow-hidden"
                    )}
                >
                  <button
                      className={cn(
                          "st-flex st-justify-between st-items-center",
                          "st-w-full st-p-5",
                          "st-text-left",
                          "st-bg-white dark:st-bg-gray-800",
                          "st-hover:bg-gray-50 dark:st-hover:bg-gray-700"
                      )}
                      onClick={() => toggleItem(item.id)}
                  >
                    <h3 className={cn("st-text-lg st-font-medium")}>{item.question}</h3>
                    <svg
                        className={cn(
                            "st-w-5 st-h-5",
                            "st-transition-transform",
                            openItem === item.id && "st-rotate-180"
                        )}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                      <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  {openItem === item.id && (
                      <div
                          className={cn(
                              "st-p-5",
                              "st-border-t",
                              "st-border-gray-200 dark:st-border-gray-700",
                              "st-bg-white dark:st-bg-gray-800"
                          )}
                      >
                        <p className={cn("st-text-gray-600 dark:st-text-gray-400")}>
                          {item.answer}
                        </p>
                      </div>
                  )}
                </div>
            ))}
          </div>
        </div>
      </section>
  )
}
