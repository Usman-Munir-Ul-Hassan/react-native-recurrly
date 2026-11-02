import { Subscription } from "@/types/subscription";

export interface NotificationDigest {
  title: string;
  body: string;
  urgentCount: number;
  subscriptionIds: string[];
}

interface BuildDigestOptions {
  thresholdDays?: number;
}

/**
 * Evaluates active subscriptions and creates a single consolidated alert
 * if any subscriptions are due within the threshold window (default <= 1 day).
 */
export function buildRenewalDigest(
  subscriptions: Subscription[],
  options?: BuildDigestOptions
): NotificationDigest | null {
  const thresholdDays = options?.thresholdDays ?? 1;

  // Filter only active subscriptions expiring soon (0 or 1 day left)
  const urgentSubs = subscriptions.filter(
    (sub) =>
      sub.status === "Active" &&
      sub.daysRemaining >= 0 &&
      sub.daysRemaining <= thresholdDays
  );

  if (urgentSubs.length === 0) {
    return null;
  }

  const subscriptionIds = urgentSubs.map((s) => s.id);

  // Case 1: Exactly 1 subscription due
  if (urgentSubs.length === 1) {
    const sub = urgentSubs[0];
    const timeWord = sub.daysRemaining === 0 ? "today" : "tomorrow";

    return {
      title: `⚠️ Renewal Alert: ${sub.name}`,
      body: `Your ${sub.name} subscription (${sub.price}) renews ${timeWord}!`,
      urgentCount: 1,
      subscriptionIds,
    };
  }

  // Case 2: 2 or more subscriptions due (Smart Batching)
  const totalAmount = urgentSubs.reduce(
    (acc, sub) => acc + (sub.amountNumeric || 0),
    0
  );

  let namesSummary = "";
  if (urgentSubs.length <= 3) {
    namesSummary = urgentSubs.map((s) => s.name).join(", ");
  } else {
    const firstTwo = urgentSubs.slice(0, 2).map((s) => s.name).join(", ");
    namesSummary = `${firstTwo} and ${urgentSubs.length - 2} others`;
  }

  return {
    title: `⚠️ ${urgentSubs.length} Subscriptions Renew Soon`,
    body: `${namesSummary} totaling $${totalAmount.toFixed(2)} renew soon.`,
    urgentCount: urgentSubs.length,
    subscriptionIds,
  };
}
