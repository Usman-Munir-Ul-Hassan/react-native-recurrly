import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { HorizontalSubscriptionCard } from "../horizontal-card";
import { Subscription } from "@/types/subscription";

jest.mock("@/context/preferences-context", () => ({
  usePreferences: () => ({
    currency: "USD",
    convertAmount: (val: number) => val,
    formatPrice: (val: number) => `$${val.toFixed(2)}/mo`,
  }),
}));

describe("HorizontalSubscriptionCard", () => {
  const baseSub: Subscription = {
    id: "sub-1",
    name: "Linear",
    initials: "LI",
    status: "Active",
    category: "Dev Tools",
    price: "$12.00/mo",
    amountNumeric: 12,
    cadence: "in 15 days",
    daysRemaining: 15,
    renewalDateShort: "Renews Nov 18",
    nextRenewalFull: "November 18, 2026",
    billingCycle: "Monthly",
    paymentMethod: "Apple Pay",
    invoiceEmail: "user@test.com",
  };

  it("renders subscription details with standard price", async () => {
    const handlePress = jest.fn();
    const { getByText } = await render(
      <HorizontalSubscriptionCard subscription={baseSub} onPress={handlePress} />
    );

    expect(getByText("Linear")).toBeTruthy();
    expect(getByText("$12.00")).toBeTruthy();
    expect(getByText("15D LEFT")).toBeTruthy();
  });

  it("formats massive prices using compact notation to avoid truncation", async () => {
    const hugeSub: Subscription = {
      ...baseSub,
      name: "Enterprise Cloud",
      amountNumeric: 1500000,
    };

    const { getByText } = await render(
      <HorizontalSubscriptionCard subscription={hugeSub} onPress={jest.fn()} />
    );

    expect(getByText("Enterprise Cloud")).toBeTruthy();
    expect(getByText("$1.5M")).toBeTruthy();
  });

  it("handles card press event", async () => {
    const handlePress = jest.fn();
    const { getByRole } = await render(
      <HorizontalSubscriptionCard subscription={baseSub} onPress={handlePress} />
    );

    fireEvent.press(getByRole("button"));
    expect(handlePress).toHaveBeenCalledTimes(1);
  });
});
