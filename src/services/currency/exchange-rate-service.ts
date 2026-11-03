import { CurrencyCode } from "@/types/preferences";
import { getCurrencySymbol } from "@/utils/currency-formatter";

export const FALLBACK_RATES: Record<CurrencyCode, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.78,
  PKR: 278.0,
  CAD: 1.36,
  INR: 83.5,
};

const RATES_API_URL = "https://open.er-api.com/v6/latest/USD";

/**
 * Ensures an exchange rate is a finite, positive number, otherwise returns the safe fallback.
 */
export function sanitizeRate(rate: unknown, fallback: number): number {
  const num = typeof rate === "number" ? rate : Number(rate);
  return typeof num === "number" && isFinite(num) && num > 0 ? num : fallback;
}

/**
 * Fetches real-time market exchange rates from a free public endpoint.
 * Returns resilient fallback rates if offline or if network fails.
 */
export async function fetchLiveExchangeRates(): Promise<Record<CurrencyCode, number>> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(RATES_API_URL, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return FALLBACK_RATES;
    }

    const json = await response.json();
    const liveRates = json?.rates;

    if (!liveRates || typeof liveRates !== "object") {
      return FALLBACK_RATES;
    }

    return {
      USD: 1.0,
      EUR: sanitizeRate(liveRates.EUR, FALLBACK_RATES.EUR),
      GBP: sanitizeRate(liveRates.GBP, FALLBACK_RATES.GBP),
      PKR: sanitizeRate(liveRates.PKR, FALLBACK_RATES.PKR),
      CAD: sanitizeRate(liveRates.CAD, FALLBACK_RATES.CAD),
      INR: sanitizeRate(liveRates.INR, FALLBACK_RATES.INR),
    };
  } catch {
    // Graceful offline fallback
    return FALLBACK_RATES;
  }
}

/**
 * Converts an amount from a source currency to the target currency using the current rates.
 * If fromCurrency === targetCurrency, returns the amount directly without conversion.
 */
export function convertCurrency(
  amount: number,
  targetCurrency: CurrencyCode,
  rates: Record<CurrencyCode, number> = FALLBACK_RATES,
  fromCurrency: CurrencyCode = "USD"
): number {
  const safeAmount = isNaN(amount) ? 0 : amount;
  if (fromCurrency === targetCurrency) {
    return safeAmount;
  }
  const fromRate = sanitizeRate(rates?.[fromCurrency], FALLBACK_RATES[fromCurrency] ?? 1.0);
  const targetRate = sanitizeRate(rates?.[targetCurrency], FALLBACK_RATES[targetCurrency] ?? 1.0);

  // Convert from source currency to USD base, then from USD to target currency
  const amountInUsd = safeAmount / fromRate;
  return amountInUsd * targetRate;
}

/**
 * Formats an amount into the target currency with symbol and optional cadence suffix.
 */
export function formatPriceWithCadence(
  amount: number,
  targetCurrency: CurrencyCode,
  rates: Record<CurrencyCode, number> = FALLBACK_RATES,
  cadenceSuffix: string = "/mo",
  fromCurrency: CurrencyCode = "USD"
): string {
  const converted = convertCurrency(amount, targetCurrency, rates, fromCurrency);
  const symbol = getCurrencySymbol(targetCurrency);
  return `${symbol}${converted.toFixed(2)}${cadenceSuffix}`;
}
