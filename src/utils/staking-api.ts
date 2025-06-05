import { UniqueIndexer } from "sdk-2";

function createIndexer(tokenSymbol: string) {
  return UniqueIndexer({
    baseUrl:
      tokenSymbol === "QTZ"
        ? "https://api-quartz.uniquescan.io/v2"
        : "https://api-unique.uniquescan.io/v2",
  });
}

export interface StakingHistoryItem {
  hash: string;
  blockNumber: number;
  section: string;
  method: string;
  blockTimestamp: string;
  amount: string;
  eventType: "Stake" | "Unstake";
}

export async function fetchStakingHistory(
  address: string,
  tokenSymbol = "UNQ"
): Promise<{
  staking: StakingHistoryItem[];
  unstaking: StakingHistoryItem[];
}> {
  try {
    const indexer = createIndexer(tokenSymbol);
    const stakeExtrinsics = await indexer.extrinsics({
      signerIn: [address],
      methodIn: ["stake"],
      sectionIn: ["appPromotion"],
      limit: 1000,
      orderByBlockNumber: "desc",
    });
    const staking: StakingHistoryItem[] = stakeExtrinsics.items
      .map((item) => {
        const stakeEvent = item.events?.find(
          (e) =>
            e.section === "appPromotion" &&
            e.method.toLowerCase().startsWith("stake")
        );

        let amount = "0";
        if (stakeEvent && stakeEvent.data) {
          amount = (stakeEvent.data["1"] ?? "0").toString();
        }

        return {
          hash: item.hash,
          blockNumber: item.blockNumber,
          section: item.section,
          method: item.method,
          blockTimestamp: new Date(item.blockTimestamp).toISOString(),
          amount,
          eventType: "Stake",
        };
      })
      .sort((a, b) => b.blockNumber - a.blockNumber);

    const unstakeExtrinsics = await indexer.extrinsics({
      signerIn: [address],
      methodIn: ["unstake", "unstakePartial", "unstakeAll"],
      sectionIn: ["appPromotion"],
      limit: 1000,
      orderByBlockNumber: "desc",
    });

    const unstaking: StakingHistoryItem[] = unstakeExtrinsics.items
      .map((item) => {
        const unstakeEvent = item.events?.find(
          (e) =>
            e.section === "appPromotion" &&
            e.method.toLowerCase().startsWith("unstake")
        );

        let amount = "0";
        if (unstakeEvent && unstakeEvent.data) {
          amount = (unstakeEvent.data["1"] ?? "0").toString();
        }

        return {
          hash: item.hash,
          blockNumber: item.blockNumber,
          section: item.section,
          method: item.method,
          blockTimestamp: new Date(item.blockTimestamp).toISOString(),
          amount,
          eventType: "Unstake",
        };
      })
      .sort((a, b) => b.blockNumber - a.blockNumber);

    return { staking, unstaking };
  } catch (error) {
    console.error("Error fetching staking history:", error);
    return { staking: [], unstaking: [] };
  }
}

export async function fetchTransferHistory(
  address: string,
  tokenSymbol = "UNQ"
): Promise<any[]> {
  try {
    const indexer = createIndexer(tokenSymbol);

    const extrinsics = await indexer.extrinsics({
      signerIn: [address],
      methodIn: ["transfer", "transferKeepAlive"],
      sectionIn: ["balances"],
      limit: 1000,
    });

    return extrinsics.items.map((item) => {
      const transferEvent = item.events?.find(
        (e) => e.section === "balances" && e.method === "Transfer"
      );

      let amount = "0";
      if (transferEvent && transferEvent.data) {
        amount = (transferEvent.data.amount ?? "0").toString();
      }

      return {
        hash: item.hash,
        blockNumber: item.blockNumber,
        section: item.section,
        method: item.method,
        blockTimestamp: new Date(item.blockTimestamp).toISOString(),
        amount,
      };
    });
  } catch (error) {
    console.error("Error fetching transfer history:", error);
    return [];
  }
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatHash(hash: string): string {
  if (!hash) return "";
  return `${hash.substring(0, 6)}...${hash.substring(hash.length - 6)}`;
}

export function formatAmount(amount: string): string {
  try {
    const bigNum = BigInt(amount);
    const divisor = BigInt(10 ** 18);
    const whole = bigNum / divisor;
    return whole.toString();
  } catch {
    return "0";
  }
}

export function formatNumber(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return value.toString();
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 4,
    minimumFractionDigits: 0,
  }).format(num);
}
