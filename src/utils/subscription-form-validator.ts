import { Subscription } from "@/types/subscription";
import { resolveBrandIconUrl } from "@/services/subscription/brand-icon-service";

export interface SubscriptionFormInput {
  name: string;
  price: string;
  category: string;
  billingCadence?: "Monthly" | "Yearly";
  billingCycle?: string;
  currencySymbol?: string;
  paymentMethod?: string;
  invoiceEmail?: string;
  logoUrl?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: {
    name?: string;
    price?: string;
  };
}

/**
 * Validates the raw user inputs for creating a new subscription.
 */
export function validateSubscriptionForm(name: string, price: string): ValidationResult {
  const errors: { name?: string; price?: string } = {};

  const cleanName = name.trim();
  if (!cleanName) {
    errors.name = "Subscription name is required.";
  }

  const cleanPrice = price.trim().replace(/[^0-9.]/g, "");
  const numericPrice = parseFloat(cleanPrice);

  if (!cleanPrice || isNaN(numericPrice) || numericPrice <= 0) {
    errors.price = "Enter a valid positive price.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Extracts 1-2 capital initials from a subscription name.
 */
export function generateInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "SB";
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/**
 * Formats date into "Nov 1" style string.
 */
function formatShortDate(date: Date): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

/**
 * Formats date into "November 1, 2026" style string.
 */
function formatFullDate(date: Date): string {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

/**
 * Builds a complete Subscription object from validated form input.
 */
export function buildNewSubscription(
  input: SubscriptionFormInput,
  options?: { customDate?: Date }
): Subscription {
  const cleanName = input.name.trim();
  const rawPrice = input.price.trim().replace(/[^0-9.]/g, "");
  const amountNumeric = parseFloat(rawPrice);
  const symbol = input.currencySymbol || "$";
  const isYearly = input.billingCadence === "Yearly";
  const cycleSuffix = isYearly ? "/yr" : "/mo";
  const formattedPrice = `${symbol}${amountNumeric.toFixed(2)}${cycleSuffix}`;

  const slug = cleanName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
  const id = `sub-${Date.now()}-${slug || "custom"}`;

  // Renewal date: 365 days for yearly, 30 days for monthly
  const baseDate = options?.customDate ?? new Date();
  const daysRemaining = isYearly ? 365 : 30;
  const renewalDate = new Date(baseDate.getTime() + daysRemaining * 24 * 60 * 60 * 1000);

  return {
    id,
    name: cleanName,
    initials: generateInitials(cleanName),
    logoUrl: input.logoUrl ?? resolveBrandIconUrl(cleanName),
    status: "Active",
    category: input.category || "General",
    price: formattedPrice,
    amountNumeric,
    cadence: `in ${daysRemaining} days`,
    daysRemaining,
    renewalDateShort: `Renews ${formatShortDate(renewalDate)}`,
    nextRenewalFull: `${formatFullDate(renewalDate)} (in ${daysRemaining} days)`,
    billingCycle: input.billingCycle || (isYearly ? "Yearly (renews automatically)" : "Monthly (renews automatically)"),
    paymentMethod: input.paymentMethod || "Apple Pay",
    invoiceEmail: input.invoiceEmail || "user@chronicle.app",
  };
}
