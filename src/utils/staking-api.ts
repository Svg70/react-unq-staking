import { UniqueIndexer, type UniqueIndexerInstance } from "sdk-2"
import { Address } from "@unique-nft/sdk/utils"

type EventsPageItems = Awaited<ReturnType<UniqueIndexerInstance["events"]>>["items"]

export interface StakingHistoryItem {
  hash: string
  blockNumber: number
  blockTimestamp: Date
  section: string
  method: string
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

    const result = extrinsics.items.map((item) => {
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
        blockTimestamp: new Date(item.blockTimestamp),
        section: item.section,
        method: item.method,
        amount: amount,
        eventType,
      }
    })

    result.sort((a, b) => b.blockNumber - a.blockNumber)

    return result
  } catch (error) {
    console.error("Error fetching staking history:", error)
    return []
  }
}

export type BalanceTransferItem = {
    blockNumber: number
    blockTimestamp: Date
    amount: bigint
    extrinsicHash: string
    direction: "in" | "out"
    section: string
    method: string
}

type TransfersHistory = {
  transfers: BalanceTransferItem[],
  stakingRewards: BalanceTransferItem[],
}

export async function fetchTransferHistory(address: string, tokenSymbol = "UNQ"): Promise<TransfersHistory> {
  const result: TransfersHistory = {transfers: [], stakingRewards: []}

  const rewards = new Map<string, BalanceTransferItem>()

  try {
    const indexer = UniqueIndexer({
      baseUrl: tokenSymbol === "QTZ" ? "https://api-quartz.uniquescan.io/v2" : "https://api-unique.uniquescan.io/v2",
    })

    const items: EventsPageItems = []

    while (true) {
      const nextPage = await indexer.events({
        address,
        methodIn: ["Transfer", "TransferKeepAlive", "StakingRecalculation"],
        limit: 1000,
        offset: items.length,
      })

      items.push(...nextPage.items)
      if (nextPage.items.length < 1000) break
    }

    for (const item of items)  {
      if (item.method === "StakingRecalculation") {

        const amountString = item.data?.["2"]?.toString() || "0"
        const amount = BigInt(amountString)

        if (amount > 0) {
          rewards.set(item.blockNumber.toString(), {
            blockNumber: item.blockNumber,
            blockTimestamp: new Date(item.blockTimestamp),
            amount,
            extrinsicHash: item.extrinsicHash,
            direction: "in",
            section: item.section,
            method: item.method,
          })
        }
      }
    }

    for (const item of items) {
      if (item.method === "Transfer" || item.method === "TransferKeepAlive") {
        const amountString = item.data?.["amount"]?.toString() || "0"
        const amount = BigInt(amountString)

        if (rewards.has(item.blockNumber.toString())) {
          const reward = rewards.get(item.blockNumber.toString())
          if (reward && reward.amount === amount) continue // Skip if this is a staking reward
        }

        if (amount < 10n ** 18n) continue // Skip small transfers (less than 1 token)

        const to = item.data?.["to"]?.toString() || ""
        const direction = to && Address.is.substrateAddress(to) && Address.compare.substrateAddresses(to, address) ? "in" : "out"

        // debugger;
        result.transfers.push({
          blockNumber: item.blockNumber,
          blockTimestamp: new Date(item.blockTimestamp),
          amount,
          extrinsicHash: item.extrinsicHash,
          direction,
          section: item.section,
          method: item.method,
        })
      }
    }

    result.stakingRewards = Array.from(rewards.values())
  } catch (error) {
    console.error("Error fetching transfer history:", error)
  }

  result.transfers.sort((a, b) => b.blockNumber - a.blockNumber)
  result.stakingRewards.sort((a, b) => b.blockNumber - a.blockNumber)

  return result
}

export function formatDate(date: string | Date): string {
  const _date = typeof date === "string" ? new Date(date) : date
  return _date.toLocaleString("en-US", {
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

export function formatAmount(amount: string | bigint): string {
  try {
    const bigNum = typeof amount === 'bigint' ? amount : BigInt(amount)
    const divisor = BigInt(10 ** 18)
    const whole = bigNum / divisor

    if (whole === 0n && bigNum > 0) return "≈0"

    return whole.toString()
  } catch (error: unknown) {
    console.error("Error formatting amount:", error)
    return "0"
  }
}

export function mapStakingHistoryItemsToCsv (items: StakingHistoryItem[]): string[][] {
    const headers = ['Block Number', 'Hash', 'Date', 'Section', 'Method', 'Amount', 'Event Type']

    const rows = items.map(item => [
        item.blockNumber.toString(),
        item.hash,
        formatDate(item.blockTimestamp),
        item.section,
        item.method,
        formatAmount(item.amount),
        item.eventType,
    ])

    return [headers, ...rows]
}

export function mapTransferHistoryToCsv(transfers: BalanceTransferItem[]): string[][] {
    const headers = ['Block Number', 'Extrinsic Hash', 'Date', 'Amount', 'Direction', 'Section', 'Method']

    const rows = transfers.map(item => [
        item.blockNumber.toString(),
        item.extrinsicHash,
        formatDate(item.blockTimestamp),
        formatAmount(item.amount),
        item.direction,
        item.section,
        item.method,
    ])

  return [headers, ...rows]
}
