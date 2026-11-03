import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import { Alert, Share } from "react-native";
import SubscriptionDetailScreen from "@/app/details/[id]";

const mockBack = jest.fn();
jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({ id: "sub-spotify" }),
  useRouter: () => ({
    back: mockBack,
  }),
}));

const mockSubscription = {
  id: "sub-spotify",
  name: "Spotify Premium",
  initials: "SP",
  status: "Active",
  category: "Entertainment",
  price: "$10.99/mo",
  amountNumeric: 10.99,
  cadence: "Monthly",
  daysRemaining: 15,
  renewalDateShort: "Nov 18",
  nextRenewalFull: "November 18, 2026",
  billingCycle: "Monthly",
  paymentMethod: "Credit Card",
  invoiceEmail: "user@example.com",
  startDate: "2026-10-18",
};

const mockCancel = jest.fn();
const mockPause = jest.fn();
const mockResume = jest.fn();
const mockDelete = jest.fn();
const mockUpdate = jest.fn();

jest.mock("@/context/subscription-context", () => ({
  useSubscriptions: () => ({
    getSubscription: () => mockSubscription,
    cancelSubscription: mockCancel,
    pauseSubscription: mockPause,
    resumeSubscription: mockResume,
    deleteSubscription: mockDelete,
    updateSubscription: mockUpdate,
  }),
}));

jest.mock("@/hooks/use-user-profile", () => ({
  useUserProfile: () => ({
    imageUrl: null,
    initials: "UM",
  }),
}));

jest.mock("@/context/preferences-context", () => ({
  usePreferences: () => ({
    formatPrice: (amount: number, cadence?: string) => `$${amount.toFixed(2)}/${cadence === "Yearly" ? "yr" : "mo"}`,
    formatCompactPrice: (amount: number) => `$${amount}`,
  }),
}));

describe("SubscriptionDetailScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, "alert").mockImplementation(() => {});
    jest.spyOn(Share, "share").mockResolvedValue({ action: "sharedAction" });
  });

  it("renders subscription details and exact price", async () => {
    const { getByText } = await render(<SubscriptionDetailScreen />);

    expect(getByText("Spotify Premium")).toBeTruthy();
    expect(getByText("$10.99/mo • Monthly")).toBeTruthy();
    expect(getByText("Active")).toBeTruthy();
    expect(getByText("Renews Nov 18")).toBeTruthy();
  });

  it("renders consolidated action buttons without redundant status buttons", async () => {
    const { getByText, queryByText, getByTestId } = await render(<SubscriptionDetailScreen />);

    expect(getByText("Edit Subscription & Cycle")).toBeTruthy();
    expect(getByText("Manage on Spotify Premium website")).toBeTruthy();
    expect(getByTestId("btn-open-status-picker")).toBeTruthy();

    // Redundant separate status buttons should NOT exist in bottom buttons
    expect(queryByText("Pause subscription")).toBeNull();
    expect(queryByText("Resume subscription")).toBeNull();
  });

  it("opens status picker modal and changes status when a status is selected", async () => {
    const { getByTestId } = await render(<SubscriptionDetailScreen />);

    await act(async () => {
      fireEvent.press(getByTestId("btn-open-status-picker"));
    });

    await act(async () => {
      fireEvent.press(getByTestId("status-option-Paused"));
    });

    expect(mockPause).toHaveBeenCalledWith("sub-spotify");
  });

  it("navigates back when header back button is pressed", async () => {
    const { getByText } = await render(<SubscriptionDetailScreen />);

    await act(async () => {
      fireEvent.press(getByText("Subscriptions"));
    });

    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it("shares receipt when header share button is pressed", async () => {
    const { getByLabelText } = await render(<SubscriptionDetailScreen />);

    await act(async () => {
      fireEvent.press(getByLabelText("Share Receipt"));
    });

    expect(Share.share).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Spotify Premium - Receipt",
        message: expect.stringContaining("CHRONICLE RECEIPT"),
      })
    );
  });

  it("sanitizes renewalDateShort so it never renders duplicate 'Renews Renews'", async () => {
    mockSubscription.renewalDateShort = "Renews Dec 1";
    const { getByText, queryByText } = await render(<SubscriptionDetailScreen />);

    expect(getByText("Renews Dec 1")).toBeTruthy();
    expect(queryByText(/Renews\s+Renews/i)).toBeNull();

    // Restore
    mockSubscription.renewalDateShort = "Nov 18";
  });

  it("prompts confirmation and deletes subscription while navigating back without flash", async () => {
    const { getByText } = await render(<SubscriptionDetailScreen />);

    let deleteAlertHandler: (() => void) | undefined;
    (Alert.alert as jest.Mock).mockImplementation((_title, _msg, buttons) => {
      const deleteBtn = buttons?.find((b: any) => b.style === "destructive" || b.text === "Delete");
      deleteAlertHandler = deleteBtn?.onPress;
    });

    await act(async () => {
      fireEvent.press(getByText("Delete from Chronicle"));
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      "Delete Subscription",
      expect.stringContaining("permanently remove Spotify Premium"),
      expect.any(Array)
    );

    await act(async () => {
      deleteAlertHandler?.();
    });

    expect(mockBack).toHaveBeenCalled();
    expect(mockDelete).toHaveBeenCalledWith("sub-spotify");
  });
});
