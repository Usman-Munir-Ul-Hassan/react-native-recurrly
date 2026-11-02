import { CurrencyCode } from "./preferences";

export type SubscriptionStatus = "Active" | "Paused" | "Cancelled";

export interface Subscription {
  id: string;
  name: string;
  initials: string;
  logoUrl?: string;
  status: SubscriptionStatus;
  category: string;
  price: string;
  amountNumeric: number;
  currency?: CurrencyCode;
  cadence: string;
  daysRemaining: number;
  renewalDateShort: string;
  nextRenewalFull: string;
  billingCycle: string;
  paymentMethod: string;
  invoiceEmail: string;
  startDate?: string;
  renewalDate?: string;
}

/**
 * Returns the recorded currency of a subscription, or safely infers it
 * from the stored price symbol (e.g. "Rs" -> "PKR") with USD fallback.
 */
export function getSubscriptionCurrency(subscription: Subscription): CurrencyCode {
  if (subscription.currency) return subscription.currency;
  const price = subscription.price || "";
  if (price.includes("Rs") || price.includes("PKR")) return "PKR";
  if (price.includes("€") || price.includes("EUR")) return "EUR";
  if (price.includes("£") || price.includes("GBP")) return "GBP";
  if (price.includes("₹") || price.includes("INR")) return "INR";
  if (price.includes("C$") || price.includes("CAD")) return "CAD";
  return "USD";
}
