import { CurrencyCode } from "@/types/preferences";
import { getCurrencySymbol } from "./currency-formatter";

/**
 * Formats a number with K (thousands), M (millions), or B (billions) suffixes
 * while keeping clean decimal precision.
 */
export function formatCompactNumber(amount: number): string {
  if (isNaN(amount) || amount === 0) return "0";

  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";

  if (absAmount >= 1_000_000_000) {
    const value = absAmount / 1_000_000_000;
    const formatted = value % 1 === 0 ? value.toFixed(0) : value.toFixed(1);
    return `${sign}${formatted}B`;
  }

  if (absAmount >= 1_000_000) {
    const value = absAmount / 1_000_000;
    const formatted = value % 1 === 0 ? value.toFixed(0) : value.toFixed(1);
    return `${sign}${formatted}M`;
  }

  if (absAmount >= 10_000) {
    // For 10,000 and above, use K with 1 or 0 decimals
    const value = absAmount / 1_000;
    const formatted = value % 1 === 0 ? value.toFixed(0) : value.toFixed(1);
    return `${sign}${formatted}K`;
  }

  if (absAmount >= 1_000) {
    // Between 1,000 and 9,999: show 1 decimal e.g. 1.5K
    const value = absAmount / 1_000;
    const formatted = value % 1 === 0 ? value.toFixed(0) : value.toFixed(1);
    return `${sign}${formatted}K`;
  }

  // Under 1,000: standard 2 decimal currency
  return `${sign}${absAmount.toFixed(2)}`;
}

/**
 * Formats currency amount in compact notation (e.g. $1.5M, Rs 250K, €12.99).
 */
export function formatCompactPrice(
  amount: number,
  currencyCode: CurrencyCode = "USD",
  suffix?: string
): string {
  const symbol = getCurrencySymbol(currencyCode);
  const compactVal = formatCompactNumber(amount);
  const suffixStr = suffix ?? "";
  return `${symbol}${compactVal}${suffixStr}`;
}
