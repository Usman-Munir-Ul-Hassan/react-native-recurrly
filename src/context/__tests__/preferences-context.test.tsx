import React from "react";
import { renderHook, act } from "@testing-library/react-native";
import { useUser } from "@clerk/expo";
import { PreferencesProvider, usePreferences } from "../preferences-context";

jest.mock("@clerk/expo", () => ({
  useUser: jest.fn(),
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

  it("updates currency and persists to user metadata", async () => {
    const mockUpdate = jest.fn().mockResolvedValue({});
    (useUser as jest.Mock).mockReturnValue({
      isLoaded: true,
      user: {
        unsafeMetadata: {},
        update: mockUpdate,
      },
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <PreferencesProvider>{children}</PreferencesProvider>
    );

    const { result } = await renderHook(() => usePreferences(), { wrapper });

    await act(async () => {
      await result.current.setCurrency("GBP");
    });

    expect(result.current.currency).toBe("GBP");
    expect(result.current.currencySymbol).toBe("£");
    expect(mockUpdate).toHaveBeenCalledWith({
      unsafeMetadata: {
        preferences: {
          currency: "GBP",
          alertsEnabled: true,
        },
      },
    });
  });

  it("updates alertsEnabled toggle and persists to user metadata", async () => {
    const mockUpdate = jest.fn().mockResolvedValue({});
    (useUser as jest.Mock).mockReturnValue({
      isLoaded: true,
      user: {
        unsafeMetadata: {},
        update: mockUpdate,
      },
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <PreferencesProvider>{children}</PreferencesProvider>
    );

    const { result } = await renderHook(() => usePreferences(), { wrapper });

    await act(async () => {
      await result.current.setAlertsEnabled(false);
    });

    expect(result.current.alertsEnabled).toBe(false);
    expect(mockUpdate).toHaveBeenCalledWith({
      unsafeMetadata: {
        preferences: {
          currency: "USD",
          alertsEnabled: false,
        },
      },
    });
  });
});
