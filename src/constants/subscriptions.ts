import { MOCK_SUBSCRIPTIONS } from "@/data/subscriptions.data";
import { Subscription } from "@/types/subscription";

// Decoupled re-exports for backwards compatibility
export * from "@/types/subscription";
export { MOCK_SUBSCRIPTIONS as SUBSCRIPTIONS } from "@/data/subscriptions.data";

export const SUBSCRIPTION_CATEGORIES = [
  "General",
  "Entertainment",
  "Work & Tools",
  "Productivity",
  "Utilities",
  "Design",
  "Dev Tools",
] as const;

export type SubscriptionCategory = (typeof SUBSCRIPTION_CATEGORIES)[number];

export const PAYMENT_METHODS = [
  "Card",
  "Apple Pay",
  "Google Pay",
  "PayPal",
  "Bank Account",
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export function getSubscriptionById(id: string): Subscription | undefined {
  return MOCK_SUBSCRIPTIONS.find((sub) => sub.id === id);
}
