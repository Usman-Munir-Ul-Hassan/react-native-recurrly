import { filterSubscriptions } from "../subscription-filter";
import { Subscription } from "@/types/subscription";

const sampleSubs: Subscription[] = [
  {
    id: "sub-1",
    name: "Spotify Premium",
    initials: "SP",
    status: "Active",
    category: "Entertainment",
    price: "$10.99/mo",
    amountNumeric: 10.99,
    cadence: "in 5 days",
    daysRemaining: 5,
    renewalDateShort: "Renews Nov 7",
    nextRenewalFull: "November 7, 2026",
    billingCycle: "Monthly",
    paymentMethod: "Apple Pay",
    invoiceEmail: "user@example.com",
  },
  {
    id: "sub-2",
    name: "GitHub Copilot",
    initials: "GH",
    status: "Active",
    category: "Dev Tools",
    price: "$10.00/mo",
    amountNumeric: 10.0,
    cadence: "in 25 days",
    daysRemaining: 25,
    renewalDateShort: "Renews Nov 27",
    nextRenewalFull: "November 27, 2026",
    billingCycle: "Monthly",
    paymentMethod: "Visa •••• 4242",
    invoiceEmail: "user@example.com",
  },
  {
    id: "sub-3",
    name: "Netflix",
    initials: "NF",
    status: "Paused",
    category: "Entertainment",
    price: "$15.99/mo",
    amountNumeric: 15.99,
    cadence: "Paused",
    daysRemaining: 0,
    renewalDateShort: "Paused",
    nextRenewalFull: "Paused",
    billingCycle: "Monthly",
    paymentMethod: "Mastercard •••• 8821",
    invoiceEmail: "user@example.com",
  },
];

describe("filterSubscriptions", () => {
  it("returns all items when tab is 'All' and query is empty", () => {
    const result = filterSubscriptions(sampleSubs, "All", "");
    expect(result).toHaveLength(3);
  });

  it("filters by status when tab is 'Active'", () => {
    const result = filterSubscriptions(sampleSubs, "Active", "");
    expect(result).toHaveLength(2);
    expect(result.map((s) => s.id)).toEqual(["sub-1", "sub-2"]);
  });

  it("filters by upcoming renewal (Active and daysRemaining <= 14)", () => {
    const result = filterSubscriptions(sampleSubs, "Upcoming renewal", "");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("sub-1");
  });

  it("filters by search query matching name case-insensitively", () => {
    const result = filterSubscriptions(sampleSubs, "All", "spotify");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Spotify Premium");
  });

  it("filters by search query matching category", () => {
    const result = filterSubscriptions(sampleSubs, "All", "dev tools");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("sub-2");
  });

  it("combines tab filter with search query", () => {
    // Both Spotify and Netflix are Entertainment, but only Spotify is Active
    const result = filterSubscriptions(sampleSubs, "Active", "entertainment");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Spotify Premium");
  });

  it("returns empty array when query does not match any items", () => {
    const result = filterSubscriptions(sampleSubs, "All", "non-existent-service");
    expect(result).toHaveLength(0);
  });
});
