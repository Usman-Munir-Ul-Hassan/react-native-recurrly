import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import { SearchInput } from "../search-input";

describe("SearchInput", () => {
  const mockOnChangeText = jest.fn();
  const mockOnClear = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with placeholder", async () => {
    const { getByPlaceholderText, queryByTestId } = await render(
      <SearchInput
        value=""
        onChangeText={mockOnChangeText}
        placeholder="Search here..."
      />
    );

    expect(getByPlaceholderText("Search here...")).toBeTruthy();
    // Clear button should not be visible when value is empty
    expect(queryByTestId("btn-clear-search")).toBeNull();
  });

  it("calls onChangeText when typing", async () => {
    const { getByTestId } = await render(
      <SearchInput value="" onChangeText={mockOnChangeText} />
    );

    await act(async () => {
      fireEvent.changeText(getByTestId("input-search-subscriptions"), "Spotify");
    });

    expect(mockOnChangeText).toHaveBeenCalledWith("Spotify");
  });

  it("renders clear button and clears text when pressed", async () => {
    const { getByTestId } = await render(
      <SearchInput
        value="Netflix"
        onChangeText={mockOnChangeText}
        onClear={mockOnClear}
      />
    );

    const clearButton = getByTestId("btn-clear-search");
    expect(clearButton).toBeTruthy();

    await act(async () => {
      fireEvent.press(clearButton);
    });

    expect(mockOnChangeText).toHaveBeenCalledWith("");
    expect(mockOnClear).toHaveBeenCalledTimes(1);
  });
});
