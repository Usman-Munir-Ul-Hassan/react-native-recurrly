import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useUser } from "@clerk/expo";
import {
  CurrencyCode,
  DEFAULT_PREFERENCES,
  UserPreferences,
} from "@/types/preferences";
import { getCurrencySymbol } from "@/utils/currency-formatter";
import {
  convertCurrency,
  FALLBACK_RATES,
  fetchLiveExchangeRates,
  formatPriceWithCadence,
} from "@/services/currency/exchange-rate-service";
import { formatCompactPrice as formatCompactPriceUtil } from "@/utils/compact-currency-formatter";

interface PreferencesContextType {
  preferences: UserPreferences;
  currency: CurrencyCode;
  currencySymbol: string;
  alertsEnabled: boolean;
  rates: Record<CurrencyCode, number>;
  setCurrency: (code: CurrencyCode) => Promise<void>;
  setAlertsEnabled: (enabled: boolean) => Promise<void>;
  toggleAlerts: () => Promise<void>;
  formatPrice: (amount: number, cadence?: string, fromCurrency?: CurrencyCode) => string;
  formatCompactPrice: (amount: number, cadence?: string, fromCurrency?: CurrencyCode) => string;
  convertAmount: (amount: number, fromCurrency?: CurrencyCode) => number;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded: isUserLoaded } = useUser();
  const currentUserId = user ? (user.id || "authenticated-user") : null;
  const [prevUserId, setPrevUserId] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [rates, setRates] = useState<Record<CurrencyCode, number>>(FALLBACK_RATES);

  // Fetch real-time market exchange rates on mount
  useEffect(() => {
    let isMounted = true;
    fetchLiveExchangeRates().then((liveRates) => {
      if (isMounted) {
        setRates(liveRates);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Synchronize preferences during render when user logs in or switches accounts
  if (isUserLoaded && prevUserId !== currentUserId) {
    setPrevUserId(currentUserId);
    const saved = user?.unsafeMetadata?.preferences as Partial<UserPreferences> | undefined;
    if (saved) {
      setPreferences({
        currency: saved.currency || DEFAULT_PREFERENCES.currency,
        alertsEnabled:
          typeof saved.alertsEnabled === "boolean"
            ? saved.alertsEnabled
            : DEFAULT_PREFERENCES.alertsEnabled,
      });
    } else {
      setPreferences(DEFAULT_PREFERENCES);
    }
  }

  const updatePreferences = useCallback(
    async (newPrefs: UserPreferences) => {
      setPreferences(newPrefs);

      if (isUserLoaded && user) {
        try {
          await user.update({
            unsafeMetadata: {
              ...user.unsafeMetadata,
              preferences: newPrefs,
            },
          });
        } catch (err) {
          console.warn("[PreferencesContext] Failed to save preferences to Clerk:", err);
        }
      }
    },
    [isUserLoaded, user]
  );

  const setCurrency = useCallback(
    async (code: CurrencyCode) => {
      await updatePreferences({ ...preferences, currency: code });
    },
    [preferences, updatePreferences]
  );

  const setAlertsEnabled = useCallback(
    async (enabled: boolean) => {
      await updatePreferences({ ...preferences, alertsEnabled: enabled });
    },
    [preferences, updatePreferences]
  );

  const toggleAlerts = useCallback(async () => {
    await updatePreferences({
      ...preferences,
      alertsEnabled: !preferences.alertsEnabled,
    });
  }, [preferences, updatePreferences]);

  const currencySymbol = useMemo(
    () => getCurrencySymbol(preferences.currency),
    [preferences.currency]
  );

  const formatPrice = useCallback(
    (amount: number, cadence?: string, fromCurrency: CurrencyCode = "USD") => {
      const suffix =
        cadence && (cadence.toLowerCase().includes("yr") || cadence.toLowerCase().includes("year"))
          ? "/yr"
          : "/mo";
      return formatPriceWithCadence(amount, preferences.currency, rates, suffix, fromCurrency);
    },
    [preferences.currency, rates]
  );

  const formatCompactPrice = useCallback(
    (amount: number, cadence?: string, fromCurrency: CurrencyCode = "USD") => {
      const converted = convertCurrency(amount, preferences.currency, rates, fromCurrency);
      const suffix =
        cadence && (cadence.toLowerCase().includes("yr") || cadence.toLowerCase().includes("year"))
          ? "/yr"
          : cadence && (cadence.toLowerCase().includes("mo") || cadence.toLowerCase().includes("month"))
          ? "/mo"
          : "";
      return formatCompactPriceUtil(converted, preferences.currency, suffix);
    },
    [preferences.currency, rates]
  );

  const convertAmount = useCallback(
    (amount: number, fromCurrency: CurrencyCode = "USD") => {
      return convertCurrency(amount, preferences.currency, rates, fromCurrency);
    },
    [preferences.currency, rates]
  );

  const value: PreferencesContextType = useMemo(
    () => ({
      preferences,
      currency: preferences.currency,
      currencySymbol,
      alertsEnabled: preferences.alertsEnabled,
      rates,
      setCurrency,
      setAlertsEnabled,
      toggleAlerts,
      formatPrice,
      formatCompactPrice,
      convertAmount,
    }),
    [
      preferences,
      currencySymbol,
      rates,
      setCurrency,
      setAlertsEnabled,
      toggleAlerts,
      formatPrice,
      formatCompactPrice,
      convertAmount,
    ]
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences(): PreferencesContextType {
  const context = useContext(PreferencesContext);
  if (!context) {
    return {
      preferences: DEFAULT_PREFERENCES,
      currency: DEFAULT_PREFERENCES.currency,
      currencySymbol: "$",
      alertsEnabled: DEFAULT_PREFERENCES.alertsEnabled,
      rates: FALLBACK_RATES,
      setCurrency: async () => {},
      setAlertsEnabled: async () => {},
      toggleAlerts: async () => {},
      formatPrice: (amt, cadence) =>
        formatPriceWithCadence(
          amt,
          DEFAULT_PREFERENCES.currency,
          FALLBACK_RATES,
          cadence && cadence.includes("yr") ? "/yr" : "/mo"
        ),
      formatCompactPrice: (amt, cadence) => {
        const converted = convertCurrency(amt, DEFAULT_PREFERENCES.currency, FALLBACK_RATES);
        const suffix =
          cadence && (cadence.toLowerCase().includes("yr") || cadence.toLowerCase().includes("year"))
            ? "/yr"
            : cadence && (cadence.toLowerCase().includes("mo") || cadence.toLowerCase().includes("month"))
            ? "/mo"
            : "";
        return formatCompactPriceUtil(converted, DEFAULT_PREFERENCES.currency, suffix);
      },
      convertAmount: (amt) => convertCurrency(amt, DEFAULT_PREFERENCES.currency, FALLBACK_RATES),
    };
  }
  return context;
}
