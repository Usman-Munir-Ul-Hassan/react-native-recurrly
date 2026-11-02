import { getDayOrdinal, formatRecurrenceNote } from "../recurrence-formatter";

describe("getDayOrdinal", () => {
  it("formats 1st, 2nd, 3rd correctly", () => {
    expect(getDayOrdinal(1)).toBe("1st");
    expect(getDayOrdinal(2)).toBe("2nd");
    expect(getDayOrdinal(3)).toBe("3rd");
  });

  it("formats teen numbers with 'th'", () => {
    expect(getDayOrdinal(11)).toBe("11th");
    expect(getDayOrdinal(12)).toBe("12th");
    expect(getDayOrdinal(13)).toBe("13th");
  });

  it("formats 20s and 30s correctly", () => {
    expect(getDayOrdinal(21)).toBe("21st");
    expect(getDayOrdinal(22)).toBe("22nd");
    expect(getDayOrdinal(23)).toBe("23rd");
    expect(getDayOrdinal(24)).toBe("24th");
    expect(getDayOrdinal(31)).toBe("31st");
  });
});

describe("formatRecurrenceNote", () => {
  it("formats monthly recurrence note", () => {
    const note = formatRecurrenceNote({
      startDate: "2026-10-18",
      cadence: "Monthly",
      daysRemaining: 15,
      renewalDateShort: "Renews Nov 18",
    });
    expect(note).toBe("Renews on the 18th of every month · 15d left");
  });

  it("formats yearly recurrence note", () => {
    const note = formatRecurrenceNote({
      startDate: "2026-10-18",
      cadence: "Yearly",
      daysRemaining: 350,
      renewalDateShort: "Renews Oct 18, 2027",
    });
    expect(note).toBe("Renews yearly on Oct 18, 2027 · 350d left");
  });
});
