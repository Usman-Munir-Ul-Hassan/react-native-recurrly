import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import { AddSubscriptionModal } from "../add-subscription-modal";

describe("AddSubscriptionModal", () => {
  const mockOnClose = jest.fn();
  const mockOnAdd = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly when visible", async () => {
    const { getByText, getByTestId } = await render(
      <AddSubscriptionModal
        visible={true}
        onClose={mockOnClose}
        onAdd={mockOnAdd}
      />
    );

    expect(getByText("Add Subscription")).toBeTruthy();
    expect(getByTestId("input-subscription-name")).toBeTruthy();
    expect(getByTestId("input-subscription-price")).toBeTruthy();
  });

  it("shows validation errors when submitted empty", async () => {
    const { getByTestId, getByText } = await render(
      <AddSubscriptionModal
        visible={true}
        onClose={mockOnClose}
        onAdd={mockOnAdd}
      />
    );

    await act(async () => {
      fireEvent.press(getByTestId("btn-submit-subscription"));
    });

    expect(getByText("Subscription name is required.")).toBeTruthy();
    expect(getByText("Enter a valid positive price.")).toBeTruthy();
    expect(mockOnAdd).not.toHaveBeenCalled();
  });

  it("calls onAdd and clears fields when valid data is submitted", async () => {
    const { getByTestId } = await render(
      <AddSubscriptionModal
        visible={true}
        onClose={mockOnClose}
        onAdd={mockOnAdd}
      />
    );

    await act(async () => {
      fireEvent.changeText(getByTestId("input-subscription-name"), "Spotify Premium");
      fireEvent.changeText(getByTestId("input-subscription-price"), "10.99");
      fireEvent.press(getByTestId("chip-category-Entertainment"));
    });

    await act(async () => {
      fireEvent.press(getByTestId("btn-submit-subscription"));
    });

    expect(mockOnAdd).toHaveBeenCalledTimes(1);
    const addedSub = mockOnAdd.mock.calls[0][0];
    expect(addedSub.name).toBe("Spotify Premium");
    expect(addedSub.amountNumeric).toBe(10.99);
    expect(addedSub.category).toBe("Entertainment");
    expect(addedSub.status).toBe("Active");
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when Cancel is pressed", async () => {
    const { getByTestId } = await render(
      <AddSubscriptionModal
        visible={true}
        onClose={mockOnClose}
        onAdd={mockOnAdd}
      />
    );

    await act(async () => {
      fireEvent.press(getByTestId("btn-cancel"));
    });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("supports custom cycle start date and passes it to onAdd", async () => {
    const { getByTestId } = await render(
      <AddSubscriptionModal
        visible={true}
        onClose={mockOnClose}
        onAdd={mockOnAdd}
      />
    );

    await act(async () => {
      fireEvent.changeText(getByTestId("input-subscription-name"), "Netflix");
      fireEvent.changeText(getByTestId("input-subscription-price"), "19.99");
      fireEvent.changeText(getByTestId("input-cycle-start-date"), "2026-10-18");
    });

    await act(async () => {
      fireEvent.press(getByTestId("btn-submit-subscription"));
    });

    expect(mockOnAdd).toHaveBeenCalledTimes(1);
    const sub = mockOnAdd.mock.calls[0][0];
    expect(sub.startDate).toBe("2026-10-18");
    expect(sub.renewalDate).toBeDefined();
    expect(sub.daysRemaining).toBeDefined();
  });

  it("renders in edit mode and calls onUpdate with updated cycle", async () => {
    const mockOnUpdate = jest.fn();
    const existingSub = {
      id: "sub-netflix",
      name: "Netflix Standard",
      initials: "NS",
      status: "Active" as const,
      category: "Entertainment",
      price: "$15.49/mo",
      amountNumeric: 15.49,
      cadence: "in 15 days",
      daysRemaining: 15,
      renewalDateShort: "Renews Nov 18",
      nextRenewalFull: "November 18, 2026",
      billingCycle: "Monthly (renews automatically)",
      paymentMethod: "Apple Pay",
      invoiceEmail: "user@test.com",
      startDate: "2026-10-18",
      renewalDate: "2026-11-18",
    };

    const { getByText, getByTestId } = await render(
      <AddSubscriptionModal
        visible={true}
        onClose={mockOnClose}
        onAdd={mockOnAdd}
        onUpdate={mockOnUpdate}
        initialSubscription={existingSub}
      />
    );

    expect(getByText("Edit Subscription")).toBeTruthy();
    expect(getByText("Save Changes")).toBeTruthy();

    await act(async () => {
      fireEvent.changeText(getByTestId("input-subscription-price"), "17.99");
    });

    await act(async () => {
      fireEvent.press(getByTestId("btn-submit-subscription"));
    });

    expect(mockOnUpdate).toHaveBeenCalledTimes(1);
    const updated = mockOnUpdate.mock.calls[0][0];
    expect(updated.id).toBe("sub-netflix");
    expect(updated.amountNumeric).toBe(17.99);
    expect(updated.price).toBe("$17.99/mo");
  });

  it("preserves subscription currency in edit mode instead of overriding with default preference", async () => {
    const mockOnUpdate = jest.fn();
    const zohoPkrSub = {
      id: "sub-zoho",
      name: "Zoho CRM",
      initials: "ZC",
      status: "Active" as const,
      category: "Productivity",
      price: "Rs 3,555.00/mo",
      amountNumeric: 3555,
      cadence: "Monthly",
      daysRemaining: 20,
      renewalDateShort: "Renews Nov 20",
      nextRenewalFull: "November 20, 2026",
      billingCycle: "Monthly",
      paymentMethod: "Bank Transfer",
      invoiceEmail: "biz@example.com",
      startDate: "2026-10-20",
      renewalDate: "2026-11-20",
      currency: "PKR" as const,
    };

    const { getByTestId } = await render(
      <AddSubscriptionModal
        visible={true}
        onClose={mockOnClose}
        onAdd={mockOnAdd}
        onUpdate={mockOnUpdate}
        initialSubscription={zohoPkrSub}
      />
    );

    await act(async () => {
      fireEvent.changeText(getByTestId("input-subscription-price"), "3800");
    });

    await act(async () => {
      fireEvent.press(getByTestId("btn-submit-subscription"));
    });

    expect(mockOnUpdate).toHaveBeenCalledTimes(1);
    const updated = mockOnUpdate.mock.calls[0][0];
    expect(updated.currency).toBe("PKR");
    expect(updated.price).toBe("Rs 3800.00/mo");
  });
});
