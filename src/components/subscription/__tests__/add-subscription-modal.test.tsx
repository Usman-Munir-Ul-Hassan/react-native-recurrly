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
});
