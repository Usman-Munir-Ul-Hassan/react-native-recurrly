import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import { CalendarPickerModal } from "../calendar-picker-modal";

describe("CalendarPickerModal", () => {
  it("renders correctly when visible and displays current month", async () => {
    const handleClose = jest.fn();
    const handleSelectDate = jest.fn();

    const { getByText } = await render(
      <CalendarPickerModal
        visible={true}
        selectedDate="2026-10-18"
        onSelectDate={handleSelectDate}
        onClose={handleClose}
        title="Select Start Date"
      />
    );

    expect(getByText("Select Start Date")).toBeTruthy();
    expect(getByText("October 2026")).toBeTruthy();
  });

  it("handles picking a day from the grid", async () => {
    const handleSelectDate = jest.fn();
    const { getByTestId } = await render(
      <CalendarPickerModal
        visible={true}
        selectedDate="2026-10-18"
        onSelectDate={handleSelectDate}
        onClose={jest.fn()}
      />
    );

    await act(async () => {
      fireEvent.press(getByTestId("calendar-day-15"));
    });

    expect(handleSelectDate).toHaveBeenCalledWith("2026-10-15");
  });

  it("navigates months with previous and next buttons", async () => {
    const { getByText, getByTestId } = await render(
      <CalendarPickerModal
        visible={true}
        selectedDate="2026-10-18"
        onSelectDate={jest.fn()}
        onClose={jest.fn()}
      />
    );

    await act(async () => {
      fireEvent.press(getByTestId("btn-calendar-prev-month"));
    });
    expect(getByText("September 2026")).toBeTruthy();

    await act(async () => {
      fireEvent.press(getByTestId("btn-calendar-next-month"));
    });
    expect(getByText("October 2026")).toBeTruthy();
  });

  it("handles quick Today preset and closes on Done", async () => {
    const handleClose = jest.fn();
    const handleSelectDate = jest.fn();
    const { getByTestId, queryByTestId } = await render(
      <CalendarPickerModal
        visible={true}
        selectedDate="2026-10-18"
        onSelectDate={handleSelectDate}
        onClose={handleClose}
      />
    );

    // Cryptic -1 Mo button has been removed to match Apple/Google standards
    expect(queryByTestId("btn-calendar-last-month")).toBeNull();

    await act(async () => {
      fireEvent.press(getByTestId("btn-calendar-today"));
    });
    expect(handleSelectDate).toHaveBeenCalled();

    await act(async () => {
      fireEvent.press(getByTestId("btn-calendar-done"));
    });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("resets view month when reopening the modal with a new selectedDate", async () => {
    const { getByText, getByTestId, rerender } = await render(
      <CalendarPickerModal
        visible={true}
        selectedDate="2026-10-18"
        onSelectDate={jest.fn()}
        onClose={jest.fn()}
      />
    );

    // Navigate to August
    await act(async () => {
      fireEvent.press(getByTestId("btn-calendar-prev-month"));
      fireEvent.press(getByTestId("btn-calendar-prev-month"));
    });
    expect(getByText("August 2026")).toBeTruthy();

    // Close and reopen with December selectedDate
    await rerender(
      <CalendarPickerModal
        visible={true}
        selectedDate="2026-12-05"
        onSelectDate={jest.fn()}
        onClose={jest.fn()}
      />
    );

    expect(getByText("December 2026")).toBeTruthy();
  });
});
