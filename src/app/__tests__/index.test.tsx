import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import SubscriptionsFeedScreen from "../(tabs)/index";

const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const mockUpcomingSubs = [
  {
    id: "sub-1",
    name: "Sub 1",
    initials: "S1",
    status: "Active",
    category: "Productivity",
    price: "$10.00/mo",
    amountNumeric: 10,
    cadence: "Monthly",
    daysRemaining: 2,
    renewalDateShort: "Nov 3",
  },
  {
    id: "sub-2",
    name: "Sub 2",
    initials: "S2",
    status: "Active",
    category: "Entertainment",
    price: "$15.00/mo",
    amountNumeric: 15,
    cadence: "Monthly",
    daysRemaining: 4,
    renewalDateShort: "Nov 5",
  },
  {
    id: "sub-3",
    name: "Sub 3",
    initials: "S3",
    status: "Active",
    category: "Dev Tools",
    price: "$20.00/mo",
    amountNumeric: 20,
    cadence: "Monthly",
    daysRemaining: 6,
    renewalDateShort: "Nov 7",
  },
];

const mockSubscriptionsContext = {
  subscriptions: mockUpcomingSubs,
  activeCount: 3,
  totalMonthlyAmount: "$1.5K",
  nextRenewalDate: "Nov 3",
  addSubscription: jest.fn(),
};

jest.mock("@/context/subscription-context", () => ({
  useSubscriptions: () => mockSubscriptionsContext,
}));

jest.mock("@/hooks/use-user-profile", () => ({
  useUserProfile: () => ({
    email: "test@example.com",
    displayName: "Test User",
    avatarUrl: null,
  }),
}));

jest.mock("@/context/preferences-context", () => ({
  usePreferences: () => ({
    currency: "USD",
    formatPrice: (amt: number) => `$${amt.toFixed(2)}`,
    formatCompactPrice: (amt: number) => `$${(amt / 1000).toFixed(1)}K`,
    convertAmount: (amt: number) => amt,
  }),
}));

describe("SubscriptionsFeedScreen - Carousel & Total Commitments", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders Total Commitments metric card with compact number notation", async () => {
    const { getByText } = await render(<SubscriptionsFeedScreen />);

    expect(getByText("Total Commitments")).toBeTruthy();
    expect(getByText("$1.5K")).toBeTruthy();
    expect(getByText("/ month")).toBeTruthy();
  });

  it("hides the left carousel button at start of scroll (scrollX = 0)", async () => {
    const { queryByTestId, getByTestId } = await render(<SubscriptionsFeedScreen />);

    // At the beginning, left button should completely disappear (not rendered)
    expect(queryByTestId("btn-carousel-scroll-left")).toBeNull();
    // Right button should be visible initially
    expect(getByTestId("btn-carousel-scroll-right")).toBeTruthy();
  });

  it("shows the left carousel button once scrolled right and hides it when scrolled back left", async () => {
    const { queryByTestId, getByTestId } = await render(<SubscriptionsFeedScreen />);

    // Initially left button is hidden
    expect(queryByTestId("btn-carousel-scroll-left")).toBeNull();

    // Tap scroll right button inside await act
    await act(async () => {
      fireEvent.press(getByTestId("btn-carousel-scroll-right"));
    });

    // Left button should now be visible
    expect(getByTestId("btn-carousel-scroll-left")).toBeTruthy();

    // Tap scroll left button to scroll back to 0
    await act(async () => {
      fireEvent.press(getByTestId("btn-carousel-scroll-left"));
    });

    // Left button should disappear again
    expect(queryByTestId("btn-carousel-scroll-left")).toBeNull();
  });

  it("hides the right carousel button when scrolled to the end of content", async () => {
    const { queryByTestId, getByTestId } = await render(<SubscriptionsFeedScreen />);

    const scrollView = getByTestId("scroll-upcoming-carousel");

    // Inform layout and content sizes: viewport 300px, content 600px
    await act(async () => {
      scrollView.props.onLayout({
        nativeEvent: { layout: { width: 300, height: 100, x: 0, y: 0 } },
      });
      scrollView.props.onContentSizeChange(600, 100);
    });

    // Scrolled to 300px (600 - 300 = 300 max scroll boundary)
    await act(async () => {
      scrollView.props.onScroll({
        nativeEvent: {
          contentOffset: { x: 300, y: 0 },
        },
      });
    });

    // Right button must disappear completely at the boundary
    expect(queryByTestId("btn-carousel-scroll-right")).toBeNull();
    // Left button must be visible
    expect(getByTestId("btn-carousel-scroll-left")).toBeTruthy();
  });
});
