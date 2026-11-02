import { Subscription } from "@/types/subscription";

export interface CategoryStat {
  category: string;
  total: number;
  count: number;
  percentage: number;
}

export interface AnalyticsSummary {
  monthlyTotal: number;
  annualTotal: number;
  averagePerSub: number;
  activeCount: number;
  pausedCount: number;
  cancelledCount: number;
  totalCount: number;
  monthlySavings: number;
  topExpense: { name: string; amount: number } | null;
  upcomingRenewalsCount: number;
  categoryBreakdown: CategoryStat[];
}

/**
 * Pure calculation engine for subscription metrics and financial analytics.
 */
export function calculateAnalytics(subscriptions: Subscription[]): AnalyticsSummary {
  const activeSubs = subscriptions.filter((s) => s.status === "Active");
  const pausedSubs = subscriptions.filter((s) => s.status === "Paused");
  const cancelledSubs = subscriptions.filter((s) => s.status === "Cancelled");

  // Monthly active spend
  const monthlyTotal = activeSubs.reduce((acc, sub) => acc + (sub.amountNumeric || 0), 0);
  const annualTotal = monthlyTotal * 12;
  const averagePerSub = activeSubs.length > 0 ? monthlyTotal / activeSubs.length : 0;

  // Monthly savings achieved by pausing or cancelling unnecessary subscriptions
  const monthlySavings = [...pausedSubs, ...cancelledSubs].reduce(
    (acc, sub) => acc + (sub.amountNumeric || 0),
    0
  );

  // Highest cost active subscription
  let topExpense: { name: string; amount: number } | null = null;
  if (activeSubs.length > 0) {
    const sorted = [...activeSubs].sort((a, b) => (b.amountNumeric || 0) - (a.amountNumeric || 0));
    topExpense = {
      name: sorted[0].name,
      amount: sorted[0].amountNumeric || 0,
    };
  }

  // Active subscriptions renewing within the next 7 days
  const upcomingRenewalsCount = activeSubs.filter(
    (s) => s.daysRemaining >= 0 && s.daysRemaining <= 7
  ).length;

  // Category breakdown calculation
  const categoryMap: Record<string, { total: number; count: number }> = {};
  activeSubs.forEach((sub) => {
    const cat = sub.category || "General";
    const amount = sub.amountNumeric || 0;
    if (!categoryMap[cat]) {
      categoryMap[cat] = { total: 0, count: 0 };
    }
    categoryMap[cat].total += amount;
    categoryMap[cat].count += 1;
  });

  const categoryBreakdown: CategoryStat[] = Object.entries(categoryMap)
    .map(([category, data]) => ({
      category,
      total: data.total,
      count: data.count,
      percentage: monthlyTotal > 0 ? Math.round((data.total / monthlyTotal) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total);

  return {
    monthlyTotal,
    annualTotal,
    averagePerSub,
    activeCount: activeSubs.length,
    pausedCount: pausedSubs.length,
    cancelledCount: cancelledSubs.length,
    totalCount: subscriptions.length,
    monthlySavings,
    topExpense,
    upcomingRenewalsCount,
    categoryBreakdown,
  };
}
