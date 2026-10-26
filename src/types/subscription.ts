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
  cadence: string;
  daysRemaining: number;
  renewalDateShort: string;
  nextRenewalFull: string;
  billingCycle: string;
  paymentMethod: string;
  invoiceEmail: string;
}
