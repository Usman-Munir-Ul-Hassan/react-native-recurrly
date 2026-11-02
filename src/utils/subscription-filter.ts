import { Subscription } from "@/types/subscription";
import { TabType } from "@/components/subscription/filter-tabs";

/**
 * Filters a list of subscriptions based on the selected tab and an optional search query.
 * Matches case-insensitively against name, category, or payment method.
 */
export function filterSubscriptions(
  subscriptions: Subscription[],
  tab: TabType,
  searchQuery: string
): Subscription[] {
  const query = searchQuery.trim().toLowerCase();

  return subscriptions.filter((sub) => {
    // 1. Tab status filtering
    if (tab === "Active" && sub.status !== "Active") {
      return false;
    }
    if (tab === "Upcoming renewal") {
      if (sub.status !== "Active" || sub.daysRemaining > 14) {
        return false;
      }
    }

    // 2. Search query filtering
    if (query) {
      const matchesName = sub.name.toLowerCase().includes(query);
      const matchesCategory = sub.category.toLowerCase().includes(query);
      const matchesPayment = sub.paymentMethod.toLowerCase().includes(query);
      return matchesName || matchesCategory || matchesPayment;
    }

    return true;
  });
}
