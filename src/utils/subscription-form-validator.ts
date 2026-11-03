import { Subscription } from "@/types/subscription";
import { CurrencyCode } from "@/types/preferences";
import { resolveBrandIconUrl } from "@/services/subscription/brand-icon-service";
import { calculateSubscriptionCycle } from "@/utils/subscription-cycle-calculator";

export interface SubscriptionFormInput {
  name: string;
  price: string;
  category: string;
  billingCadence?: "Monthly" | "Yearly";
  billingCycle?: string;
  currencySymbol?: string;
  currency?: CurrencyCode;
  paymentMethod?: string;
  invoiceEmail?: string;
  logoUrl?: string;
  startDate?: string;
  renewalDate?: string;
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

  const cycle = calculateSubscriptionCycle({
    startDateInput: input.startDate,
    renewalDateInput: input.renewalDate,
    cadence: input.billingCadence,
    referenceToday: options?.customDate,
  });

  return {
    id,
    name: cleanName,
    initials: generateInitials(cleanName),
    logoUrl: input.logoUrl ?? resolveBrandIconUrl(cleanName),
    status: "Active",
    category: input.category || "General",
    price: formattedPrice,
    amountNumeric,
    cadence: cycle.cadenceText,
    daysRemaining: cycle.daysRemaining,
    renewalDateShort: cycle.renewalDateShort,
    nextRenewalFull: cycle.nextRenewalFull,
    billingCycle: input.billingCycle || (isYearly ? "Yearly (renews automatically)" : "Monthly (renews automatically)"),
    paymentMethod: input.paymentMethod || "Apple Pay",
    invoiceEmail: input.invoiceEmail || "user@chronicle.app",
    startDate: cycle.startDate,
    renewalDate: cycle.renewalDate,
    currency: input.currency || "USD",
  };
}

export interface UpdateSubscriptionInput {
  existing: Subscription;
  name: string;
  price: string;
  category: string;
  cadence: "Monthly" | "Yearly";
  paymentMethod: string;
  startDate: string;
  renewalDate?: string;
  currencySymbol?: string;
  currency?: CurrencyCode;
  logoUrl?: string;
}

/**
 * Builds an updated Subscription object preserving existing immutable attributes
 * while synchronizing recalculated billing cycle dates and metrics.
 */
export function buildUpdatedSubscription(input: UpdateSubscriptionInput): Subscription {
  const cleanName = input.name.trim();
  const rawPrice = input.price.trim().replace(/[^0-9.]/g, "");
  const amountNumeric = parseFloat(rawPrice);
  const symbol = input.currencySymbol || "$";
  const isYearly = input.cadence === "Yearly";
  const cycleSuffix = isYearly ? "/yr" : "/mo";
  const formattedPrice = `${symbol}${amountNumeric.toFixed(2)}${cycleSuffix}`;

  const cycle = calculateSubscriptionCycle({
    startDateInput: input.startDate,
    renewalDateInput: input.renewalDate,
    cadence: input.cadence,
  });

  return {
    ...input.existing,
    name: cleanName,
    initials: generateInitials(cleanName),
    price: formattedPrice,
    amountNumeric,
    category: input.category,
    paymentMethod: input.paymentMethod,
    billingCycle: isYearly ? "Yearly (renews automatically)" : "Monthly (renews automatically)",
    startDate: cycle.startDate,
    renewalDate: cycle.renewalDate,
    renewalDateShort: cycle.renewalDateShort,
    nextRenewalFull: cycle.nextRenewalFull,
    daysRemaining: cycle.daysRemaining,
    cadence: cycle.cadenceText,
    logoUrl: input.logoUrl ?? resolveBrandIconUrl(cleanName),
    currency: input.currency ?? input.existing.currency ?? "USD",
  };
}

