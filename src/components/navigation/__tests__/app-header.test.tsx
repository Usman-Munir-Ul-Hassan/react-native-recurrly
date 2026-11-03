import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import { Alert } from "react-native";
import { AppHeader } from "../app-header";
import { requestNotificationPermissions } from "@/services/notification/renewal-notification-service";

const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const mockToggleAlerts = jest.fn();
let mockAlertsEnabled = false;

jest.mock("@/context/preferences-context", () => ({
  usePreferences: () => ({
    alertsEnabled: mockAlertsEnabled,
    toggleAlerts: mockToggleAlerts,
  }),
}));

jest.mock("@/hooks/use-user-profile", () => ({
  useUserProfile: () => ({
    displayName: "Alex Developer",
    initials: "AD",
    imageUrl: "https://example.com/avatar.png",
  }),
}));

jest.mock("@/services/notification/renewal-notification-service", () => ({
  requestNotificationPermissions: jest.fn(),
}));

describe("AppHeader Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAlertsEnabled = false;
    jest.spyOn(Alert, "alert").mockImplementation(() => {});
  });

  it("renders user display name and avatar", async () => {
    const { getByText } = await render(<AppHeader />);

    expect(getByText("Welcome back")).toBeTruthy();
    expect(getByText("Alex Developer")).toBeTruthy();
  });

  it("requests notification permissions before enabling alerts when currently disabled", async () => {
    (requestNotificationPermissions as jest.Mock).mockResolvedValueOnce(true);

    const { getByRole } = await render(<AppHeader />);
    const bellButton = getByRole("button", { name: /Renewal alerts muted/i });

    await act(async () => {
      fireEvent.press(bellButton);
    });

    expect(requestNotificationPermissions).toHaveBeenCalledTimes(1);
    expect(mockToggleAlerts).toHaveBeenCalledTimes(1);
    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it("shows an alert and does not enable notifications if permission is denied", async () => {
    (requestNotificationPermissions as jest.Mock).mockResolvedValueOnce(false);

    const { getByRole } = await render(<AppHeader />);
    const bellButton = getByRole("button", { name: /Renewal alerts muted/i });

    await act(async () => {
      fireEvent.press(bellButton);
    });

    expect(requestNotificationPermissions).toHaveBeenCalledTimes(1);
    expect(mockToggleAlerts).not.toHaveBeenCalled();
    expect(Alert.alert).toHaveBeenCalledWith(
      "Notifications Required",
      expect.stringContaining("Please enable notifications in your device settings")
    );
  });

  it("directly mutes notifications when alerts are already enabled without re-requesting permission", async () => {
    mockAlertsEnabled = true;

    const { getByRole } = await render(<AppHeader />);
    const bellButton = getByRole("button", { name: /Renewal alerts active/i });

    await act(async () => {
      fireEvent.press(bellButton);
    });

    expect(requestNotificationPermissions).not.toHaveBeenCalled();
    expect(mockToggleAlerts).toHaveBeenCalledTimes(1);
  });
});
