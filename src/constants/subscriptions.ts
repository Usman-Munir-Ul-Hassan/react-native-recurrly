export interface Subscription {
  id: string;
  initials: string;
  name: string;
  status: "Active" | "Paused" | "Cancelled";
  renewalDateShort: string;
  price: string;
  cadence: string;
  billingCycle: string;
  nextRenewalFull: string;
  paymentMethod: string;
  category: string;
  invoiceEmail: string;
}

export const SUBSCRIPTIONS: Subscription[] = [
  {
    id: "claude-pro",
    initials: "CP",
    name: "Claude Pro",
    status: "Active",
    renewalDateShort: "Renews Nov 1",
    price: "$20/mo",
    cadence: "in 3 days",
    billingCycle: "Monthly (renews automatically)",
    nextRenewalFull: "November 1, 2026 (in 3 days)",
    paymentMethod: "Mastercard •••• 4242",
    category: "AI & Inference",
    invoiceEmail: "alex@example.com",
  },
  {
    id: "github-copilot",
    initials: "GH",
    name: "GitHub Copilot",
    status: "Active",
    renewalDateShort: "Renews Nov 14",
    price: "$10/mo",
    cadence: "Monthly",
    billingCycle: "Monthly (renews automatically)",
    nextRenewalFull: "November 14, 2026",
    paymentMethod: "Visa •••• 1092",
    category: "Dev Tools",
    invoiceEmail: "alex@example.com",
  },
  {
    id: "figma",
    initials: "FG",
    name: "Figma",
    status: "Active",
    renewalDateShort: "Renews Nov 18",
    price: "$15/mo",
    cadence: "Monthly",
    billingCycle: "Monthly (renews automatically)",
    nextRenewalFull: "November 18, 2026",
    paymentMethod: "Mastercard •••• 4242",
    category: "Design",
    invoiceEmail: "alex@example.com",
  },
  {
    id: "notion",
    initials: "NT",
    name: "Notion",
    status: "Active",
    renewalDateShort: "Renews Nov 22",
    price: "$10/mo",
    cadence: "Monthly",
    billingCycle: "Monthly (renews automatically)",
    nextRenewalFull: "November 22, 2026",
    paymentMethod: "Mastercard •••• 4242",
    category: "Productivity",
    invoiceEmail: "alex@example.com",
  },
  {
    id: "netflix",
    initials: "NF",
    name: "Netflix",
    status: "Active",
    renewalDateShort: "Renews Nov 27",
    price: "$23/mo",
    cadence: "Monthly",
    billingCycle: "Monthly (renews automatically)",
    nextRenewalFull: "November 27, 2026",
    paymentMethod: "Apple Pay •••• 8821",
    category: "Entertainment",
    invoiceEmail: "alex@example.com",
  },
  {
    id: "chatgpt-plus",
    initials: "OA",
    name: "ChatGPT Plus",
    status: "Active",
    renewalDateShort: "Renews Dec 3",
    price: "$20/mo",
    cadence: "Monthly",
    billingCycle: "Monthly (renews automatically)",
    nextRenewalFull: "December 3, 2026",
    paymentMethod: "Mastercard •••• 4242",
    category: "AI & Inference",
    invoiceEmail: "alex@example.com",
  },
  {
    id: "spotify-duo",
    initials: "SP",
    name: "Spotify Duo",
    status: "Active",
    renewalDateShort: "Renews Dec 10",
    price: "$15/mo",
    cadence: "Monthly",
    billingCycle: "Monthly (renews automatically)",
    nextRenewalFull: "December 10, 2026",
    paymentMethod: "PayPal",
    category: "Entertainment",
    invoiceEmail: "alex@example.com",
  },
  {
    id: "icloud-plus",
    initials: "AP",
    name: "iCloud+ (2TB)",
    status: "Active",
    renewalDateShort: "Renews Dec 15",
    price: "$15/mo",
    cadence: "Monthly",
    billingCycle: "Monthly (renews automatically)",
    nextRenewalFull: "December 15, 2026",
    paymentMethod: "Apple ID Balance",
    category: "Cloud Storage",
    invoiceEmail: "alex@example.com",
  },
];

export function getSubscriptionById(id: string): Subscription | undefined {
  return SUBSCRIPTIONS.find((sub) => sub.id === id);
}
