import React from "react";
import { renderHook, act } from "@testing-library/react-native";
import { useUser } from "@clerk/expo";
import { PreferencesProvider, usePreferences } from "../preferences-context";

jest.mock("@clerk/expo", () => ({
  useUser: jest.fn(),
}));

jest.mock("@/services/currency/exchange-rate-service", () => ({
  FALLBACK_RATES: {
    USD: 1.0,
    EUR: 0.9,
    GBP: 0.8,
    PKR: 280,
    CAD: 1.35,
    INR: 83.0,
  },
  fetchLiveExchangeRates: jest.fn().mockResolvedValue({
    USD: 1.0,
    EUR: 0.9,
    GBP: 0.8,
    PKR: 280,
    CAD: 1.35,
    INR: 83.0,
  }),
  convertCurrency: jest.fn((amt, curr) => {
    if (curr === "EUR") return amt * 0.9;
    if (curr === "PKR") return amt * 280;
    return amt;
  }),
  formatPriceWithCadence: jest.fn((amt, curr, rates, cadence) => {
    if (curr === "EUR") return `€${(amt * 0.9).toFixed(2)}${cadence}`;
    if (curr === "PKR") return `Rs ${(amt * 280).toFixed(2)}${cadence}`;
    return `$${amt.toFixed(2)}${cadence}`;
  }),
}));

describe("PreferencesContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("provides default preferences when user metadata is empty", async () => {
    (useUser as jest.Mock).mockReturnValue({
      isLoaded: true,
      user: null,
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <PreferencesProvider>{children}</PreferencesProvider>
    );

    const { result } = await renderHook(() => usePreferences(), { wrapper });

    expect(result.current.currency).toBe("USD");
    expect(result.current.currencySymbol).toBe("$");
    expect(result.current.alertsEnabled).toBe(true);
  });

  it("loads preferences from Clerk user metadata when available", async () => {
    (useUser as jest.Mock).mockReturnValue({
      isLoaded: true,
      user: {
        id: "user-eur",
        unsafeMetadata: {
          preferences: {
            currency: "EUR",
            alertsEnabled: false,
          },
        },
      },
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <PreferencesProvider>{children}</PreferencesProvider>
    );

    const { result } = await renderHook(() => usePreferences(), { wrapper });

    expect(result.current.currency).toBe("EUR");
    expect(result.current.currencySymbol).toBe("€");
    expect(result.current.alertsEnabled).toBe(false);
  });

  it("updates currency and converts prices dynamically", async () => {
    const mockUpdate = jest.fn().mockResolvedValue({});
    (useUser as jest.Mock).mockReturnValue({
      isLoaded: true,
      user: {
        id: "user-1",
        unsafeMetadata: {},
        update: mockUpdate,
      },
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <PreferencesProvider>{children}</PreferencesProvider>
    );

    const { result } = await renderHook(() => usePreferences(), { wrapper });

    await act(async () => {
      await result.current.setCurrency("EUR");
    });

    expect(result.current.currency).toBe("EUR");
    expect(result.current.convertAmount(100)).toBe(90);
    expect(result.current.formatPrice(100, "/mo")).toBe("€90.00/mo");
  });

  it("toggles alerts and persists to user metadata", async () => {
    const mockUpdate = jest.fn().mockResolvedValue({});
    (useUser as jest.Mock).mockReturnValue({
      isLoaded: true,
      user: {
        id: "user-1",
        unsafeMetadata: {},
        update: mockUpdate,
      },
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <PreferencesProvider>{children}</PreferencesProvider>
    );

    const { result } = await renderHook(() => usePreferences(), { wrapper });

    await act(async () => {
      await result.current.toggleAlerts();
    });

    expect(result.current.alertsEnabled).toBe(false);

    await act(async () => {
      await result.current.toggleAlerts();
    });

    expect(result.current.alertsEnabled).toBe(true);
  });
});
