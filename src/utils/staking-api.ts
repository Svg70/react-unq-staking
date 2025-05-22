import { UniqueIndexer } from "sdk-2"

export interface StakingHistoryItem {
  hash: string
  blockNumber: number
  section: string
  method: string
  createdAt: string
  amount: string
  eventType: "Stake" | "Unstake"
}

export async function fetchStakingHistory(address: string, tokenSymbol = "UNQ"): Promise<StakingHistoryItem[]> {
  try {
    const indexer = UniqueIndexer({
      baseUrl: tokenSymbol === "QTZ" ? "https://api-quartz.uniquescan.io/v2" : "https://api-unique.uniquescan.io/v2",
    })

    const extrinsics = await indexer.extrinsics({
      signerIn: [address],
      methodIn: ["stake", "unstake", "unstakePartial", "unstakeAll"],
      sectionIn: ["appPromotion"],
    })

    return extrinsics.items.map((item) => {
      const m = item.method.toLowerCase()
      const eventType: "Stake" | "Unstake" = m.startsWith("unstake") ? "Unstake" : "Stake"

      const stakeEvent = item.events?.find(
        (event) => event.section === "appPromotion" && event.method.toLowerCase().startsWith(eventType.toLowerCase()),
      )

      let amount = "0"

      if (stakeEvent && stakeEvent.data) {
        if (eventType === "Stake") {
          amount = (stakeEvent.data["1"] ?? "0").toString()
        } else {
          amount = (stakeEvent.data["1"] ?? "0").toString()
          // amount = (stakeEvent.data.amount ?? stakeEvent.data["0"] ?? "0").toString()
        }
      }

      return {
        hash: item.hash,
        blockNumber: item.blockNumber,
        section: item.section,
        method: item.method,
        createdAt: new Date(item.createdAt).toISOString(),
        amount: amount,
        eventType,
      }
    })
  } catch (error) {
    console.error("Error fetching staking history:", error)
    return []
  }
}

export async function fetchTransferHistory(address: string, tokenSymbol = "UNQ"): Promise<any[]> {
  try {
    const indexer = UniqueIndexer({
      baseUrl: tokenSymbol === "QTZ" ? "https://api-quartz.uniquescan.io/v2" : "https://api-unique.uniquescan.io/v2",
    })

    const extrinsics = await indexer.extrinsics({
      signerIn: [address],
      methodIn: ["transfer", "transferKeepAlive"],
      sectionIn: ["balances"],
    })

    return extrinsics.items.map((item) => {
      const transferEvent = item.events?.find((event) => event.section === "balances" && event.method === "Transfer")

      let amount = "0"
      if (transferEvent && transferEvent.data) {
        amount = (transferEvent.data.amount ?? "0").toString()
      }

      return {
        hash: item.hash,
        blockNumber: item.blockNumber,
        section: item.section,
        method: item.method,
        createdAt: new Date(item.createdAt).toISOString(),
        amount: amount,
      }
    })
  } catch (error) {
    console.error("Error fetching transfer history:", error)
    return []
  }
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatHash(hash: string): string {
  if (!hash) return ""
  return `${hash.substring(0, 6)}...${hash.substring(hash.length - 6)}`
}

export function formatAmount(amount: string): string {
  try {
    const bigNum = BigInt(amount)
    const divisor = BigInt(10 ** 18)
    const whole = bigNum / divisor
    return whole.toString()
  } catch (error) {
    return "0"
  }
}
