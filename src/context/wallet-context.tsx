"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode, useMemo } from "react"
import type { Wallet, WalletAccount } from "@talismn/connect-wallets"
import type { Signer as PolkadotSigner, SignerResult } from "@polkadot/api/types"
import { Sdk } from "@unique-nft/sdk/full"
import { getCookie, setCookie } from "@/utils/cookies"
import type { SignerPayloadJSONDto } from "@unique-nft/sdk"
import {useIsMobile} from '@/components/ui/use-mobile.tsx';

const TOTAL_STAKES = 10;

interface UNIQUE_SDK_UnsignedTxPayloadBody {
  signerPayloadJSON: SignerPayloadJSONDto
  signerPayloadRaw?: any
  signerPayloadHex: string
}

interface UNIQUE_SDK_SignTxResultResponse {
  signature: string
}

export interface BalanceDataItem {
    raw: string
    amount: string
    formatted: string
    decimals: number
    unit: string
  }

// Balance data interface from SDK
interface BalanceData {
  availableBalance?:BalanceDataItem
  lockedBalance?: BalanceDataItem
  freeBalance?: {
    raw: string
    amount: string
    formatted: string
    decimals: number
    unit: string
  }
  totalBalance?: BalanceDataItem
  reservedBalance?: BalanceDataItem
  stakedBalance?: BalanceDataItem
  unstakedBalance?: BalanceDataItem
  canstakeBalance?: BalanceDataItem
  address: string
  vested: any[]
}

// Main interface for SDK-compatible accounts
export interface IPolkadotExtensionAccountForSDK {
  name: string
  address: string
  addressShort: string
  signer: PolkadotSigner
  uniqueSdkSigner: {
    sign: (unsignedTxPayload: UNIQUE_SDK_UnsignedTxPayloadBody) => Promise<UNIQUE_SDK_SignTxResultResponse>
  }
  meta?: {
    genesisHash?: string | null
    name?: string
    source: string
  }
  type?: any
  originalTalismanSigner?: PolkadotSigner
}

export type AugmentedWalletAccount = IPolkadotExtensionAccountForSDK

interface WalletContextType {
  connected: boolean
  wallet?: Wallet
  accounts: IPolkadotExtensionAccountForSDK[]
  selectedAccount: IPolkadotExtensionAccountForSDK | null
  stakesLeft: number
  isLoading: boolean
  isConnecting: boolean
  isInitializing: boolean
  setWallet: (wallet: Wallet | undefined) => void
  setAccounts: (talismanAccounts: WalletAccount[]) => void
  selectAccount: (account: IPolkadotExtensionAccountForSDK) => void
  stakeWithSDK: (amount: string, isAll?: boolean) => Promise<any>
  unstakeWithSDK: (amount: string, isAll?: boolean) => Promise<any>
  walletAddress: string | null
  stakedBalance: string
  availableToStake: string
  tokenSymbol: string
  setTokenSymbol: (token: string) => void
  refreshBalances: () => Promise<void>
  refreshTransactionHistory: () => Promise<void>
  getSubscanUrl: (txHash: string) => string
  initialLoadComplete: boolean
  registerRefreshCallback: (callback: () => void) => () => void
  balanceData: BalanceData | null
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function useWallet() {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error("useWallet must be used within WalletProvider")
  return ctx
}

interface WalletProviderProps {
  children: ReactNode
}

const COOKIE_WALLET_ADDRESS = "stakefin_wallet_address"
const COOKIE_TOKEN_SYMBOL = "stakefin_token_symbol"
const COOKIE_WALLET_NAME = "stakefin_wallet_name"

export function WalletProvider({ children }: WalletProviderProps) {
  const [wallet, _setWallet] = useState<Wallet>()
  const isMobile = useIsMobile()
  const [accounts, _setAccounts] = useState<IPolkadotExtensionAccountForSDK[]>([])
  const [selectedAccount, _setSelectedAccount] = useState<IPolkadotExtensionAccountForSDK | null>(null)
  const [stakesLeft, setStakesLeft] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [stakedBalance, setStakedBalance] = useState("0 UNQ")
  const [availableToStake, setAvailableToStake] = useState("0 UNQ")
  const [tokenSymbol, setTokenSymbol] = useState("UNQ")
  const [isInitialized, setIsInitialized] = useState(false)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)
  const [refreshCallbacks, setRefreshCallbacks] = useState<Array<() => void>>([])
  const [balanceData, setBalanceData] = useState<BalanceData | null>(null)

  const connected = !!selectedAccount
  const walletAddress = selectedAccount?.address || null

  // Generate Subscan URL for a transaction
  const getSubscanUrl = useCallback(
    (txHash: string | any) => {
      try {
        let hash = txHash
        if (typeof txHash === "object" && txHash !== null) {
          hash = txHash.hash || ""
        }
        hash = String(hash || "")
        if (!hash) {
          console.error("Invalid transaction hash for Subscan URL:", txHash)
          return ""
        }
        const baseUrl = tokenSymbol === "QTZ" ? "https://quartz.subscan.io" : "https://unique.subscan.io"
        return `${baseUrl}/extrinsic/${hash}`
      } catch (error) {
        console.error("Error generating Subscan URL:", error)
        return ""
      }
    },
    [tokenSymbol],
  )

  // Persist wallet name in cookies
  useEffect(() => {
    if (wallet?.extensionName) {
      setCookie(COOKIE_WALLET_NAME, wallet.extensionName, 30)
    }
  }, [wallet])

  // Persist selected account in cookies
  useEffect(() => {
    if (selectedAccount?.address) {
      setCookie(COOKIE_WALLET_ADDRESS, selectedAccount.address, 30)
    }
  }, [selectedAccount])

  // Persist token symbol in cookies
  useEffect(() => {
    setCookie(COOKIE_TOKEN_SYMBOL, tokenSymbol, 30)
  }, [tokenSymbol])

  // Load token symbol from cookies on init
  useEffect(() => {
    const savedTokenSymbol = getCookie(COOKIE_TOKEN_SYMBOL)
    if (savedTokenSymbol && ["UNQ", "QTZ"].includes(savedTokenSymbol)) {
      setTokenSymbol(savedTokenSymbol)
    }
    setIsInitialized(true)
  }, [])

  // Select API base URL according to token
  const getSdkBaseUrl = useCallback(() => {
    return tokenSymbol === "QTZ" ? "https://rest.unique.network/quartz/v1" : "https://rest.unique.network/unique/v1"
  }, [tokenSymbol])

const formatBalance = useCallback((raw: string, symbol: string) => {
  try {
    const DECIMALS = 18
    const DISPLAY_DECIMALS = 4

    const rawBigInt = BigInt(raw)
    const divisor = BigInt(10 ** DECIMALS)

    const whole = rawBigInt / divisor
    const fraction = rawBigInt % divisor

    const fractionStr = fraction
      .toString()
      .padStart(DECIMALS, '0')
      .substring(0, DISPLAY_DECIMALS)

    return `${whole.toString()}.${fractionStr} ${symbol}`
  } catch {
    return `0 ${symbol}`
  }
}, [])

  // Refresh on-chain balances
  const refreshBalances = useCallback(async () => {
    if (!connected || !selectedAccount) return

    // Only show loading indicator on initial load
    if (!initialLoadComplete) {
      setIsLoading(true)
    }

    try {
      const sdk = new Sdk({ baseUrl: getSdkBaseUrl() })
      const data = await sdk.balance.get({ address: selectedAccount.address })

      // Store the full balance data
      setBalanceData(data)

      // Update the simplified balance values for backward compatibility
      if (data.stakedBalance) {
        setStakedBalance(formatBalance(data.stakedBalance.raw, tokenSymbol))
      }

      if (data.availableBalance) {
        setAvailableToStake(formatBalance(data.availableBalance.raw, tokenSymbol))
      }

      // Get stakes left
      const getStakesLeftApiCall = async (acc: IPolkadotExtensionAccountForSDK) => {
        try {
          const result = await sdk.stateQuery.execute(
            { endpoint: "query", module: "appPromotion", method: "stakesPerAccount" },
            { args: [acc.address] },
          )
          return TOTAL_STAKES - Number(result.human || 0)
        } catch {
          return 0
        }
      }

      const newStakesLeft = await getStakesLeftApiCall(selectedAccount)
      setStakesLeft(newStakesLeft)
      setInitialLoadComplete(true)
    } catch (error) {
      console.error("Error refreshing balances:", error)
    } finally {
      setIsLoading(false)
    }
  }, [connected, selectedAccount, getSdkBaseUrl, tokenSymbol, initialLoadComplete, formatBalance])

  // Notify transaction history listeners
  const refreshTransactionHistory = useCallback(async () => {
    // Call all registered callbacks
    refreshCallbacks.forEach((callback) => callback())
    return Promise.resolve()
  }, [refreshCallbacks])

  const registerRefreshCallback = useCallback((callback: () => void) => {
    setRefreshCallbacks((prev) => [...prev, callback])

    // Return a function to unregister the callback
    return () => {
      setRefreshCallbacks((prev) => prev.filter((cb) => cb !== callback))
    }
  }, [])

  // Update balances when account or token changes
  useEffect(() => {
    if (!selectedAccount) {
      setStakesLeft(0)
      setStakedBalance(`0 ${tokenSymbol}`)
      setAvailableToStake(`0 ${tokenSymbol}`)
      setBalanceData(null)
      return
    }
    refreshBalances()
  }, [selectedAccount, tokenSymbol, refreshBalances])

  // Transform wallet account to SDK-compatible account
const transformAccount = useCallback(
  (
    talismanAccount: WalletAccount,
    currentWallet?: Wallet
  ): IPolkadotExtensionAccountForSDK | null => {
    const originalSigner = talismanAccount.signer as PolkadotSigner | undefined;
    if (
      !originalSigner ||
      typeof originalSigner.signPayload !== "function" ||
      typeof originalSigner.signRaw !== "function"
    ) {
      console.warn(`Account ${talismanAccount.address} missing valid signer methods.`);
      return null;
    }

    const address = talismanAccount.address;
    const name = talismanAccount.name || "Unnamed Account";

    const source =
      currentWallet?.extensionName ||
      "unknown";

    const uniqueSdkSignMethod = async (
      unsignedTxPayload: UNIQUE_SDK_UnsignedTxPayloadBody
    ): Promise<UNIQUE_SDK_SignTxResultResponse> => {
      if (!originalSigner.signPayload) {
        throw new Error("signPayload method is unavailable");
      }
      const payloadToSign = {
        ...unsignedTxPayload.signerPayloadJSON,
        address,
      };
      const signerResult: SignerResult = await originalSigner.signPayload(
        //@ts-ignore
        payloadToSign
      );
      return { signature: signerResult.signature };
    };

    const transformedAccount: IPolkadotExtensionAccountForSDK = {
      address,
      name,
      addressShort: `${address.slice(0, 6)}...${address.slice(-6)}`,
      signer: originalSigner,
      uniqueSdkSigner: { sign: uniqueSdkSignMethod },
      meta: {
        source,      // здесь теперь хранится extensionName
        name,
        genesisHash: null,
      },
      type: talismanAccount.name,
      originalTalismanSigner: originalSigner,
    };
    return transformedAccount;
  },
  []
);

  // Update stakes left on account change
  useEffect(() => {
    if (!selectedAccount) {
      setStakesLeft(0)
      return
    }
    setIsLoading(true)
    const getStakesLeftApiCall = async (acc: IPolkadotExtensionAccountForSDK): Promise<number> => {
      await new Promise((resolve) => setTimeout(resolve, 100))
      return 8
    }
    getStakesLeftApiCall(selectedAccount)
      .then(setStakesLeft)
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [selectedAccount])

  // Internal wallet setter logic
  const setWalletInternal = useCallback(
    (w: Wallet | undefined) => {
      _setWallet(w)
      _setAccounts([])
      _setSelectedAccount(null)
      if (w) {
        setIsConnecting(true)
        //@ts-ignore
        w.enable("Unique Staking")
          .then(() => w.getAccounts())
          .then((talismanAccounts: any) => {
            const newSdkAccounts = talismanAccounts
              .map((acc: any) => transformAccount(acc, w))
              .filter((acc: any): acc is IPolkadotExtensionAccountForSDK => acc !== null)
            _setAccounts(newSdkAccounts)
            if (newSdkAccounts.length > 0) {
              const savedAddress = getCookie(COOKIE_WALLET_ADDRESS)
              const savedAccount = newSdkAccounts.find((acc: any) => acc.address === savedAddress)
              _setSelectedAccount(savedAccount || newSdkAccounts[0])
            }
            setIsConnecting(false)
          })
          .catch((err: any) => {
            console.error("Failed to enable/get accounts:", err)
            _setWallet(undefined)
            _setAccounts([])
            _setSelectedAccount(null)
            setIsConnecting(false)
          })
      }
    },
    [transformAccount],
  )

  // Auto-connect saved wallet
  useEffect(() => {
    if (!isInitialized) return
    setIsInitializing(true)
    const autoConnectWallet = async () => {
      try {
        const savedWalletName = getCookie(COOKIE_WALLET_NAME)
        if (!savedWalletName) {
          setIsInitializing(false)
          return
        }
        setIsConnecting(true)
        const { getWallets } = await import("@talismn/connect-wallets")
        const availableWallets = getWallets().filter((w) => {
          if (w.extensionName !== 'polkadot-js') return true

          const isNova = w.title === 'Nova Wallet'

          return isMobile ? isNova : !isNova
        })

        const savedWallet = availableWallets.find((w) => w.extensionName === savedWalletName)
        if (!savedWallet || !savedWallet.installed) {
          setIsConnecting(false)
          setIsInitializing(false)
          return
        }
        setWalletInternal(savedWallet)
      } catch (error) {
        console.error("Failed to st-auto-connect wallet:", error)
        setIsConnecting(false)
        setIsInitializing(false)
      }
    }
    autoConnectWallet()
  }, [isInitialized, setWalletInternal])

  // Finish initialization when connecting ends
  useEffect(() => {
    if (!isConnecting && isInitializing) {
      setIsInitializing(false)
    }
  }, [isConnecting, isInitializing])

  const setWalletProvider = useCallback(
    (newWallet: Wallet | undefined) => {
      setWalletInternal(newWallet)
    },
    [setWalletInternal],
  )

  const setAccountsProvider = useCallback(
    (talismanAccounts: WalletAccount[]) => {
      const currentW = wallet
      const newSdkAccounts = talismanAccounts
        .map((acc) => transformAccount(acc, currentW))
        .filter((acc): acc is IPolkadotExtensionAccountForSDK => acc !== null)
      _setAccounts(newSdkAccounts)
      _setSelectedAccount((curr) => curr || newSdkAccounts[0] || null)
    },
    [transformAccount, wallet],
  )

  const selectAccountProvider = useCallback((account: IPolkadotExtensionAccountForSDK) => {
    _setSelectedAccount(account)
  }, [])

  const setTokenSymbolProvider = useCallback((token: string) => {
    setTokenSymbol(token)
  }, [])

  // Stake tokens via SDK
  const stakeWithSDK = async (amount: string): Promise<any> => {
    if (!connected || !selectedAccount) throw new Error("SDK_STAKE: Account not connected.")
    setIsLoading(true)
    try {
      const sdk = new Sdk({ baseUrl: getSdkBaseUrl() })
      const method = "stake"
      const args = [amount]
      const result = await sdk.extrinsics.submitWaitResult(
        { address: selectedAccount.address, section: "appPromotion", method, args },
        //@ts-ignore
        selectedAccount.uniqueSdkSigner,
      )
      await refreshBalances()
      await refreshTransactionHistory()
      return result
    } catch (error) {
      console.error("SDK_STAKE failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Unstake tokens via SDK
  const unstakeWithSDK = async (amount: string, isAll = false): Promise<any> => {
    if (!connected || !selectedAccount) throw new Error("SDK_UNSTAKE: Account not connected.")
    setIsLoading(true)
    try {
      const sdk = new Sdk({ baseUrl: getSdkBaseUrl() })
      const method = isAll || !amount ? "unstakeAll" : "unstakePartial"
      const args = isAll || !amount ? [] : [amount]
      const result = await sdk.extrinsics.submitWaitResult(
        { address: selectedAccount.address, section: "appPromotion", method, args },
        selectedAccount.uniqueSdkSigner,
      )
      await refreshBalances()
      await refreshTransactionHistory()
      return result
    } catch (error) {
      console.error("SDK_UNSTAKE failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const contextValue = useMemo(
    () => ({
      connected,
      wallet,
      accounts,
      selectedAccount,
      stakesLeft,
      isLoading,
      isConnecting,
      isInitializing,
      setWallet: setWalletProvider,
      setAccounts: setAccountsProvider,
      selectAccount: selectAccountProvider,
      stakeWithSDK,
      unstakeWithSDK,
      walletAddress,
      stakedBalance,
      availableToStake,
      tokenSymbol,
      setTokenSymbol: setTokenSymbolProvider,
      refreshBalances,
      refreshTransactionHistory,
      getSubscanUrl,
      initialLoadComplete,
      registerRefreshCallback,
      balanceData,
    }),
    [
      connected,
      wallet,
      accounts,
      selectedAccount,
      stakesLeft,
      isLoading,
      isConnecting,
      isInitializing,
      setWalletProvider,
      setAccountsProvider,
      selectAccountProvider,
      walletAddress,
      stakedBalance,
      availableToStake,
      tokenSymbol,
      setTokenSymbolProvider,
      refreshBalances,
      refreshTransactionHistory,
      getSubscanUrl,
      initialLoadComplete,
      registerRefreshCallback,
      balanceData,
    ],
  )

  return <WalletContext.Provider value={contextValue}>{children}</WalletContext.Provider>
}

export default WalletContext
