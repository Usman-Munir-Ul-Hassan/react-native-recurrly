import { buildRenewalDigest } from "../notification-digest-builder";
import { Subscription } from "@/types/subscription";

const createMockSub = (overrides: Partial<Subscription>): Subscription => ({
  id: "sub-1",
  name: "Netflix",
  initials: "NF",
  status: "Active",
  category: "Entertainment",
  price: "$15.00/mo",
  amountNumeric: 15.0,
  cadence: "in 1 day",
  daysRemaining: 1,
  renewalDateShort: "Renews Tomorrow",
  nextRenewalFull: "Tomorrow",
  billingCycle: "Monthly",
  paymentMethod: "Apple Pay",
  invoiceEmail: "user@example.com",
  ...overrides,
});

describe("buildRenewalDigest", () => {
  it("returns null when no subscriptions have <= 1 day remaining", () => {
    const subs = [createMockSub({ daysRemaining: 5 }), createMockSub({ daysRemaining: 12 })];
    expect(buildRenewalDigest(subs)).toBeNull();
  });

  it("ignores paused and cancelled subscriptions even if daysRemaining <= 1", () => {
    const subs = [
      createMockSub({ status: "Cancelled", daysRemaining: 1 }),
      createMockSub({ status: "Paused", daysRemaining: 0 }),
    ];
    expect(buildRenewalDigest(subs)).toBeNull();
  });

  it("formats single alert when exactly 1 subscription is due tomorrow", () => {
    const subs = [createMockSub({ name: "Spotify", price: "$10.00/mo", daysRemaining: 1 })];
    const digest = buildRenewalDigest(subs);

    expect(digest).not.toBeNull();
    expect(digest?.title).toBe("⚠️ Renewal Alert: Spotify");
    expect(digest?.body).toBe("Your Spotify subscription ($10.00/mo) renews tomorrow!");
    expect(digest?.urgentCount).toBe(1);
  });

  it("formats single alert when 1 subscription is due today", () => {
    const subs = [createMockSub({ name: "Claude Pro", price: "$20.00/mo", daysRemaining: 0 })];
    const digest = buildRenewalDigest(subs);

    expect(digest).not.toBeNull();
    expect(digest?.title).toBe("⚠️ Renewal Alert: Claude Pro");
    expect(digest?.body).toBe("Your Claude Pro subscription ($20.00/mo) renews today!");
  });

  it("consolidates 3 subscriptions into 1 bundled digest with summed price", () => {
    const subs = [
      createMockSub({ id: "1", name: "Spotify", amountNumeric: 10, daysRemaining: 1 }),
      createMockSub({ id: "2", name: "Netflix", amountNumeric: 15, daysRemaining: 0 }),
      createMockSub({ id: "3", name: "ChatGPT", amountNumeric: 20, daysRemaining: 1 }),
    ];

    const digest = buildRenewalDigest(subs);

    expect(digest).not.toBeNull();
    expect(digest?.title).toBe("⚠️ 3 Subscriptions Renew Soon");
    expect(digest?.body).toBe("Spotify, Netflix, ChatGPT totaling $45.00 renew soon.");
    expect(digest?.urgentCount).toBe(3);
    expect(digest?.subscriptionIds).toEqual(["1", "2", "3"]);
  });

  it("summarizes cleanly when more than 3 subscriptions are due", () => {
    const subs = [
      createMockSub({ id: "1", name: "Sub A", amountNumeric: 5, daysRemaining: 1 }),
      createMockSub({ id: "2", name: "Sub B", amountNumeric: 5, daysRemaining: 1 }),
      createMockSub({ id: "3", name: "Sub C", amountNumeric: 5, daysRemaining: 1 }),
      createMockSub({ id: "4", name: "Sub D", amountNumeric: 5, daysRemaining: 1 }),
    ];

    const digest = buildRenewalDigest(subs);
    expect(digest?.title).toBe("⚠️ 4 Subscriptions Renew Soon");
    expect(digest?.body).toBe("Sub A, Sub B and 2 others totaling $20.00 renew soon.");
  });
});
