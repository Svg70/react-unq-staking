"use client"

import {useState, useEffect} from "react"
import {useWallet} from "@/context/wallet-context"
import {useTab} from "@/context/tab-context"
import TokenSelector from "@/components/token-selector"
import WalletInfo from "@/components/wallet-info"
import CustomTooltip from "@/components/custom-tooltip"
import {toNano} from "@/lib/toNano"

const ESTIMATE_FEE = 0.15
const MIN_STAKE_AMOUNT = 100;

interface StakingFormProps {
    onConnectWallet: () => void
    onStartStaking?: () => void
    onStakingSuccess?: (hash: string) => void
    onStakingError?: (error: string) => void
}

export default function StakingForm({
                                        onConnectWallet,
                                        onStartStaking,
                                        onStakingSuccess,
                                        onStakingError,
                                    }: StakingFormProps) {
    const {
        connected,
        availableToStake,
        stakesLeft,
        isLoading,
        selectedAccount,
        stakeWithSDK,
        refreshBalances,
        refreshTransactionHistory,
        tokenSymbol,
        setTokenSymbol,
    } = useWallet()

    const {registerTabChangeCallback} = useTab()

    const [amount, setAmount] = useState("")
    const [isStaking, setIsStaking] = useState(false)
    const [isMaxAmount, setIsMaxAmount] = useState(false)
    const [isValidAmount, setIsValidAmount] = useState(false)
    const [validationMessage, setValidationMessage] = useState("")

    // Get max available amount
    const getMaxAmount = () => {
        const availableMatch = availableToStake.match(/[\d.]+/)
        return availableMatch ? availableMatch[0] : "0"
    }

    // Validate amount
    const validateAmount = (value: string) => {
        // If amount is empty, it's not valid but we don't show an error
        if (!value) {
            setIsValidAmount(false)
            setValidationMessage("")
            return
        }

        const maxAmount = getMaxAmount()
        const maxAmountNum = Number.parseFloat(maxAmount)
        const maxNet = Math.max(maxAmountNum - ESTIMATE_FEE, 0)
        const maxNetStr = maxNet.toFixed(4)
        const amountNum = Number.parseFloat(value)

        if (isNaN(amountNum)) {
            setIsValidAmount(false)
            setValidationMessage("Please enter a valid number")
            return
        }

        if (amountNum < MIN_STAKE_AMOUNT) {
            setIsValidAmount(false)
            setValidationMessage(`Minimum staking amount is 100 ${tokenSymbol}`)
            return
        }

        if (amountNum > maxNet) {
            setIsValidAmount(false)
            setValidationMessage(
                `Amount must not exceed available balance minus fee (${maxNetStr} ${tokenSymbol})`
            )
            return
        }

        setIsValidAmount(true)
        setValidationMessage("")
        setIsMaxAmount(value === maxNetStr)
    }

    useEffect(() => {
        validateAmount(amount)
    }, [amount, availableToStake, tokenSymbol])

    useEffect(() => {
        const resetForm = () => {
            setAmount("")
            setIsValidAmount(true)
            setValidationMessage("")
            setIsMaxAmount(false)
        }

        // Register the callback for the stake tab
        const unregister = registerTabChangeCallback("stake", resetForm)

        // Clean up on unmount
        return unregister
    }, [registerTabChangeCallback])

    const handleStake = async () => {
        if (!connected || !isValidAmount) return

        setIsStaking(true)
        onStartStaking?.()

        try {
            const amountInNano = toNano(amount, 18)
            const hash = await stakeWithSDK(amountInNano)
            // Refresh balances and transaction history
            await refreshBalances()
            await refreshTransactionHistory()

            onStakingSuccess?.(hash)
        } catch (error) {
            console.error("Staking failed:", error)
            onStakingError?.((error as Error).message || "Transaction failed. Please try again.")
        } finally {
            setIsStaking(false)
            setAmount('')
        }
    }

    const handleMaxAmount = () => {
        const max = parseFloat(getMaxAmount())
        const net = Math.max(max - ESTIMATE_FEE, 0)
        const str = net.toFixed(4)
        setAmount(str)
        validateAmount(str)
        setIsMaxAmount(true)
    }

    return (
        <div className="flex flex-col space-y-6">
            {/* Token Selection */}
            <div>
                <label className="block text-lg font-normal text-gray-700 dark:text-gray-300 mb-2">Token</label>
                <TokenSelector selectedToken={tokenSymbol} onSelectToken={setTokenSymbol}/>
            </div>

            {/* Connect Wallet or Wallet Info */}
            {connected ? (
                <WalletInfo activeTab="stake"/>
            ) : (
                <div className="flex justify-center mt-4">
                    <button
                        onClick={onConnectWallet}
                        className="w-full px-6 py-3 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
                    >
                        Connect Wallet
                    </button>
                </div>
            )}

            {/* Staking Form (only shown when connected) */}
            {connected && (
                <>
                    <div>
                        <label
                            className="block text-lg font-normal text-gray-700 dark:text-gray-300 mb-2">Amount</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={amount}
                                onChange={(e) => {
                                    setAmount(e.target.value)
                                    setIsMaxAmount(e.target.value === getMaxAmount())
                                }}
                                className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 ${
                                    !amount || isValidAmount
                                        ? "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100"
                                        : "border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-500"
                                }`}
                                placeholder={`Enter amount to stake (min 100 ${tokenSymbol})`}
                                disabled={isLoading || isStaking}
                            />
                            <button
                                onClick={handleMaxAmount}
                                className={`absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 text-sm ${
                                    isMaxAmount
                                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                        : "bg-white text-blue-500 dark:bg-gray-700 dark:text-blue-300"
                                } rounded hover:bg-blue-50 dark:hover:bg-gray-600`}
                                disabled={isLoading || isStaking}
                            >
                                Max
                            </button>
                        </div>
                        {validationMessage &&
                            <p className="text-lg font-medium text-red-500 dark:text-red-400 mt-1">{validationMessage}</p>}
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            You can deposit any amount from a minimum of 100 tokens up to 10 times
                        </p>
                    </div>

                    {/* Staking Information */}
                    <div className="space-y-2 mt-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center">
                                <span className="text-gray-700 dark:text-gray-300">Annual percentage yield</span>
                                <CustomTooltip text="The annual rate of return on investment" useQtipIcon={true}/>
                            </div>
                            <span className="font-medium dark:text-gray-200">18%</span>
                        </div>

                        <div className="flex justify-between items-center font-normal">
                            <span className="text-gray-700 dark:text-gray-300">Transaction cost</span>
                            <span className=" dark:text-gray-200">≈0.1 {tokenSymbol}</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <div className="flex items-center">
                                <span className="text-gray-700 dark:text-gray-300">Stakes left</span>
                                <CustomTooltip text="You can create up to 10 stakes from one wallet"
                                               useQtipIcon={true}/>
                            </div>
                            <span className="font-medium dark:text-gray-200">{stakesLeft}</span>
                        </div>
                    </div>

                    {/* Stake Button */}
                    <button
                        onClick={handleStake}
                        disabled={isStaking || isLoading || !isValidAmount}
                        className={`w-full px-[24px] py-[16px] text-base font-semibold rounded-md ${
                            isStaking || isLoading || !isValidAmount
                                ? "bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed"
                                : isMaxAmount
                                    ? "bg-green-500 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
                                    : "bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                        } transition-colors`}
                    >
                        {isStaking ? "Staking..." : isMaxAmount ? "Stake All" : "Stake"}
                    </button>
                </>
            )}
        </div>
    )
}
