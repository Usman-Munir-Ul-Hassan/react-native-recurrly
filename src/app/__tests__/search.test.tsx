import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import SearchScreen from "../search";

// Mock router
const mockBack = jest.fn();
const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    back: mockBack,
    push: mockPush,
  }),
}));

// Mock useSubscriptions
const mockSubscriptions = [
  {
    id: "sub-spotify",
    name: "Spotify Premium",
    initials: "SP",
    status: "Active",
    category: "Entertainment",
    price: "$10.99/mo",
    amountNumeric: 10.99,
    cadence: "in 5 days",
    daysRemaining: 5,
    renewalDateShort: "Renews Nov 7",
    nextRenewalFull: "November 7, 2026",
    billingCycle: "Monthly",
    paymentMethod: "Apple Pay",
    invoiceEmail: "user@example.com",
  },
  {
    id: "sub-linear",
    name: "Linear Pro",
    initials: "LN",
    status: "Active",
    category: "Dev Tools",
    price: "$12.00/mo",
    amountNumeric: 12.0,
    cadence: "in 20 days",
    daysRemaining: 20,
    renewalDateShort: "Renews Nov 22",
    nextRenewalFull: "November 22, 2026",
    billingCycle: "Monthly",
    paymentMethod: "Visa •••• 4242",
    invoiceEmail: "user@example.com",
  },
];

jest.mock("@/context/subscription-context", () => ({
  useSubscriptions: () => ({
    subscriptions: mockSubscriptions,
  }),
}));

describe("SearchScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders search input, category chips, and initial subscriptions", async () => {
    const { getByTestId, getByText } = await render(<SearchScreen />);

    expect(getByTestId("input-search-screen")).toBeTruthy();
    expect(getByTestId("btn-back-from-search")).toBeTruthy();
    expect(getByText("Spotify Premium")).toBeTruthy();
    expect(getByText("Linear Pro")).toBeTruthy();
  });

  it("filters results when user types a query", async () => {
    const { getByTestId, queryByText } = await render(<SearchScreen />);

    await act(async () => {
      fireEvent.changeText(getByTestId("input-search-screen"), "Linear");
    });

    expect(queryByText("Linear Pro")).toBeTruthy();
    expect(queryByText("Spotify Premium")).toBeNull();
  });

  it("filters results when category chip is pressed", async () => {
    const { getByTestId, queryByText } = await render(<SearchScreen />);

    await act(async () => {
      fireEvent.press(getByTestId("chip-search-cat-Dev Tools"));
    });

    expect(queryByText("Linear Pro")).toBeTruthy();
    expect(queryByText("Spotify Premium")).toBeNull();
  });

  it("navigates back when back button is pressed", async () => {
    const { getByTestId } = await render(<SearchScreen />);

    await act(async () => {
      fireEvent.press(getByTestId("btn-back-from-search"));
    });

    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
