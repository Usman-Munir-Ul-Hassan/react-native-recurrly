export type CurrencyCode = "USD" | "EUR" | "GBP" | "PKR" | "CAD" | "INR";

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  label: string;
}

export interface UserPreferences {
  currency: CurrencyCode;
  alertsEnabled: boolean;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  currency: "USD",
  alertsEnabled: true,
};
