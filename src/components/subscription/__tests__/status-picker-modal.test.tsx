import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import { StatusPickerModal } from "../status-picker-modal";

describe("StatusPickerModal", () => {
  const mockOnSelect = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all 3 statuses with descriptions and subscription name", async () => {
    const { getByText, getByTestId } = await render(
      <StatusPickerModal
        visible={true}
        currentStatus="Active"
        onSelectStatus={mockOnSelect}
        onClose={mockOnClose}
        subscriptionName="Spotify"
      />
    );

    expect(getByText("Subscription Status")).toBeTruthy();
    expect(getByText("Choose status for Spotify")).toBeTruthy();
    expect(getByTestId("status-option-Active")).toBeTruthy();
    expect(getByTestId("status-option-Paused")).toBeTruthy();
    expect(getByTestId("status-option-Cancelled")).toBeTruthy();
  });

  it("calls onSelectStatus and onClose when a status is pressed", async () => {
    const { getByTestId } = await render(
      <StatusPickerModal
        visible={true}
        currentStatus="Active"
        onSelectStatus={mockOnSelect}
        onClose={mockOnClose}
      />
    );

    await act(async () => {
      fireEvent.press(getByTestId("status-option-Paused"));
    });

    expect(mockOnSelect).toHaveBeenCalledWith("Paused");
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("closes modal when close button is pressed", async () => {
    const { getByTestId } = await render(
      <StatusPickerModal
        visible={true}
        currentStatus="Active"
        onSelectStatus={mockOnSelect}
        onClose={mockOnClose}
      />
    );

    await act(async () => {
      fireEvent.press(getByTestId("btn-close-status-modal"));
    });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
