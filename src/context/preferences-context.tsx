import React, {
  createContext,
  useCallback,
  useContext,
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

interface PreferencesContextType {
  preferences: UserPreferences;
  currency: CurrencyCode;
  currencySymbol: string;
  alertsEnabled: boolean;
  setCurrency: (code: CurrencyCode) => Promise<void>;
  setAlertsEnabled: (enabled: boolean) => Promise<void>;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded: isUserLoaded } = useUser();
  const currentUserId = user ? (user.id || "authenticated-user") : null;
  const [prevUserId, setPrevUserId] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);

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

  const currencySymbol = useMemo(
    () => getCurrencySymbol(preferences.currency),
    [preferences.currency]
  );

  const value: PreferencesContextType = useMemo(
    () => ({
      preferences,
      currency: preferences.currency,
      currencySymbol,
      alertsEnabled: preferences.alertsEnabled,
      setCurrency,
      setAlertsEnabled,
    }),
    [preferences, currencySymbol, setCurrency, setAlertsEnabled]
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
      setCurrency: async () => {},
      setAlertsEnabled: async () => {},
    };
  }
  return context;
}
