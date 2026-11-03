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

  it("blocks duplicate submission when typo of existing service is entered under same email", async () => {
    const existingSubs = [
      {
        id: "sub-1",
        name: "Google Cloud",
        initials: "GC",
        status: "Active" as const,
        category: "Dev Tools",
        price: "$20.00/mo",
        amountNumeric: 20,
        cadence: "Monthly",
        daysRemaining: 15,
        renewalDateShort: "Nov 18",
        nextRenewalFull: "November 18, 2026",
        billingCycle: "Monthly",
        paymentMethod: "Card",
        invoiceEmail: "work@company.com",
      },
    ];

    const { getByTestId, findByText } = await render(
      <AddSubscriptionModal
        visible={true}
        onClose={mockOnClose}
        onAdd={mockOnAdd}
        userEmail="work@company.com"
        existingSubscriptions={existingSubs}
      />
    );

    await act(async () => {
      fireEvent.changeText(getByTestId("input-subscription-name"), "Google Cload");
      fireEvent.changeText(getByTestId("input-subscription-price"), "25");
      fireEvent.changeText(getByTestId("input-account-email"), "work@company.com");
    });

    await act(async () => {
      fireEvent.press(getByTestId("btn-submit-subscription"));
    });

    // Should NOT add and should show duplicate error
    expect(mockOnAdd).not.toHaveBeenCalled();
    const errorMsg = await findByText(/already exists for account/i);
    expect(errorMsg).toBeTruthy();
  });

  it("allows same subscription name when account email is different (multi-account)", async () => {
    const existingSubs = [
      {
        id: "sub-1",
        name: "Google Cloud",
        initials: "GC",
        status: "Active" as const,
        category: "Dev Tools",
        price: "$20.00/mo",
        amountNumeric: 20,
        cadence: "Monthly",
        daysRemaining: 15,
        renewalDateShort: "Nov 18",
        nextRenewalFull: "November 18, 2026",
        billingCycle: "Monthly",
        paymentMethod: "Card",
        invoiceEmail: "work@company.com",
      },
    ];

    const { getByTestId } = await render(
      <AddSubscriptionModal
        visible={true}
        onClose={mockOnClose}
        onAdd={mockOnAdd}
        userEmail="personal@gmail.com"
        existingSubscriptions={existingSubs}
      />
    );

    await act(async () => {
      fireEvent.changeText(getByTestId("input-subscription-name"), "Google Cloud");
      fireEvent.changeText(getByTestId("input-subscription-price"), "25");
      fireEvent.changeText(getByTestId("input-account-email"), "personal@gmail.com");
    });

    await act(async () => {
      fireEvent.press(getByTestId("btn-submit-subscription"));
    });

    // Permitted because account email is different!
    expect(mockOnAdd).toHaveBeenCalledTimes(1);
    const newSub = mockOnAdd.mock.calls[0][0];
    expect(newSub.name).toBe("Google Cloud");
    expect(newSub.invoiceEmail).toBe("personal@gmail.com");
  });
});
