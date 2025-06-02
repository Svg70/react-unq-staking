export function toDecimalString(raw: string, decimals: number): string {
    const valueBigInt = BigInt(raw)
    if (valueBigInt === 0n) return "0"

    const divisor = 10n ** BigInt(decimals)
    const whole = valueBigInt / divisor
    const fraction = valueBigInt % divisor

    const fullFractionStr = fraction.toString().padStart(decimals, "0")
    const fracStrDisplay = fullFractionStr.slice(0, 4) // берём 4 цифры после запятой

    if (whole === 0n && /^[0]+$/.test(fracStrDisplay)) {
        return "0"
    }

    if (fracStrDisplay === "" || /^[0]+$/.test(fracStrDisplay)) {
        return whole.toString()
    }

    return `${whole.toString()}.${fracStrDisplay}`
}