import { CurrencyCode, CurrencyConfig } from "@/types/preferences";

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: "USD", symbol: "$", label: "USD ($) - US Dollar" },
  { code: "EUR", symbol: "€", label: "EUR (€) - Euro" },
  { code: "GBP", symbol: "£", label: "GBP (£) - British Pound" },
  { code: "PKR", symbol: "Rs ", label: "PKR (Rs) - Pakistani Rupee" },
  { code: "CAD", symbol: "C$", label: "CAD (C$) - Canadian Dollar" },
  { code: "INR", symbol: "₹", label: "INR (₹) - Indian Rupee" },
];

const CURRENCY_SYMBOL_MAP: Record<CurrencyCode, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  PKR: "Rs ",
  CAD: "C$",
  INR: "₹",
};

/**
 * Returns the symbol corresponding to a currency code.
 */
export function getCurrencySymbol(code: CurrencyCode = "USD"): string {
  return CURRENCY_SYMBOL_MAP[code] ?? "$";
}

/**
 * Formats a numeric amount with the selected currency symbol and 2 decimal places.
 */
export function formatCurrencyAmount(
  amount: number,
  currencyCode: CurrencyCode = "USD"
): string {
  const symbol = getCurrencySymbol(currencyCode);
  const safeAmount = isNaN(amount) ? 0 : amount;
  return `${symbol}${safeAmount.toFixed(2)}`;
}
