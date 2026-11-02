import { calculateAnalytics } from "../analytics-calculator";
import { Subscription } from "@/types/subscription";

const createMockSub = (overrides: Partial<Subscription>): Subscription => ({
  id: "sub-1",
  name: "Netflix",
  initials: "NF",
  status: "Active",
  category: "Entertainment",
  price: "$15.00/mo",
  amountNumeric: 15.0,
  cadence: "in 10 days",
  daysRemaining: 10,
  renewalDateShort: "Nov 12",
  nextRenewalFull: "November 12, 2026",
  billingCycle: "Monthly",
  paymentMethod: "Apple Pay",
  invoiceEmail: "user@example.com",
  ...overrides,
});

describe("calculateAnalytics", () => {
  it("handles empty subscription list gracefully", () => {
    const summary = calculateAnalytics([]);

    expect(summary.monthlyTotal).toBe(0);
    expect(summary.annualTotal).toBe(0);
    expect(summary.averagePerSub).toBe(0);
    expect(summary.activeCount).toBe(0);
    expect(summary.pausedCount).toBe(0);
    expect(summary.cancelledCount).toBe(0);
    expect(summary.monthlySavings).toBe(0);
    expect(summary.topExpense).toBeNull();
    expect(summary.upcomingRenewalsCount).toBe(0);
    expect(summary.categoryBreakdown).toEqual([]);
  });

  it("calculates active monthly and annual totals correctly", () => {
    const subs = [
      createMockSub({ id: "1", name: "Spotify", amountNumeric: 10, category: "Entertainment" }),
      createMockSub({ id: "2", name: "GitHub", amountNumeric: 20, category: "Dev Tools" }),
      createMockSub({ id: "3", name: "Claude Pro", amountNumeric: 20, category: "AI & Inference" }),
    ];

    const summary = calculateAnalytics(subs);

    expect(summary.monthlyTotal).toBe(50);
    expect(summary.annualTotal).toBe(600);
    expect(summary.averagePerSub).toBeCloseTo(16.67, 1);
    expect(summary.activeCount).toBe(3);
    expect(summary.pausedCount).toBe(0);
    expect(summary.cancelledCount).toBe(0);
  });

  it("calculates savings from paused and cancelled subscriptions", () => {
    const subs = [
      createMockSub({ id: "1", name: "Active 1", amountNumeric: 20, status: "Active" }),
      createMockSub({ id: "2", name: "Paused 1", amountNumeric: 15, status: "Paused" }),
      createMockSub({ id: "3", name: "Cancelled 1", amountNumeric: 25, status: "Cancelled" }),
    ];

    const summary = calculateAnalytics(subs);

    expect(summary.monthlyTotal).toBe(20);
    expect(summary.monthlySavings).toBe(40); // 15 + 25
    expect(summary.pausedCount).toBe(1);
    expect(summary.cancelledCount).toBe(1);
    expect(summary.totalCount).toBe(3);
  });

  it("identifies highest expense and upcoming renewals in <= 7 days", () => {
    const subs = [
      createMockSub({ id: "1", name: "Cheap", amountNumeric: 5, daysRemaining: 3 }),
      createMockSub({ id: "2", name: "Mid", amountNumeric: 15, daysRemaining: 7 }),
      createMockSub({ id: "3", name: "Expensive", amountNumeric: 40, daysRemaining: 15 }),
    ];

    const summary = calculateAnalytics(subs);

    expect(summary.topExpense).toEqual({ name: "Expensive", amount: 40 });
    expect(summary.upcomingRenewalsCount).toBe(2); // 3 and 7 days
  });

  it("calculates category breakdown percentages sorted descending", () => {
    const subs = [
      createMockSub({ id: "1", amountNumeric: 60, category: "Dev Tools" }),
      createMockSub({ id: "2", amountNumeric: 20, category: "Entertainment" }),
      createMockSub({ id: "3", amountNumeric: 20, category: "Dev Tools" }),
    ];

    const summary = calculateAnalytics(subs);

    expect(summary.categoryBreakdown).toHaveLength(2);
    expect(summary.categoryBreakdown[0]).toEqual({
      category: "Dev Tools",
      total: 80,
      count: 2,
      percentage: 80,
    });
    expect(summary.categoryBreakdown[1]).toEqual({
      category: "Entertainment",
      total: 20,
      count: 1,
      percentage: 20,
    });
  });
});
