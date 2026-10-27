// Decoupled re-exports for backwards compatibility
export * from "@/types/subscription";
export { MOCK_SUBSCRIPTIONS as SUBSCRIPTIONS } from "@/data/subscriptions.data";
import { MOCK_SUBSCRIPTIONS } from "@/data/subscriptions.data";
import { Subscription } from "@/types/subscription";

export function getSubscriptionById(id: string): Subscription | undefined {
  return MOCK_SUBSCRIPTIONS.find((sub) => sub.id === id);
}
