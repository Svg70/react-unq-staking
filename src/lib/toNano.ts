import { BN } from "@polkadot/util"

export function toNano(amount: string, decimals = 18): string {
  const [whole, fraction = ""] = amount.split(".")
  const fracPart = (fraction + "0".repeat(decimals)).slice(0, decimals)
  const normalized = (whole + fracPart).replace(/^0+(?=\d)/, "")
  return new BN(normalized, 10).toString()
}