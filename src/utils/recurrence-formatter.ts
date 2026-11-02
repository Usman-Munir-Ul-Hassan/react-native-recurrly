import { parseDateSafe } from "./subscription-cycle-calculator";

/**
 * Returns the English ordinal suffix for a day number (e.g. 1 -> "1st", 2 -> "2nd", 11 -> "11th").
 */
export function getDayOrdinal(day: number): string {
  if (day >= 11 && day <= 13) return `${day}th`;
  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
}

export interface RecurrenceNoteParams {
  startDate: string;
  cadence: "Monthly" | "Yearly";
  daysRemaining: number;
  renewalDateShort: string;
}

/**
 * Generates an empathetic, human-sounding recurrence explanation caption.
 * e.g. "Renews on the 18th of every month · 15d left" or "Renews yearly on Nov 18 · 365d left"
 */
export function formatRecurrenceNote({
  startDate,
  cadence,
  daysRemaining,
  renewalDateShort,
}: RecurrenceNoteParams): string {
  if (cadence === "Yearly") {
    const cleanDate = renewalDateShort.replace(/^Renews\s+/i, "");
    return `Renews yearly on ${cleanDate} · ${daysRemaining}d left`;
  }

  const startObj = parseDateSafe(startDate);
  const day = startObj.getDate();
  return `Renews on the ${getDayOrdinal(day)} of every month · ${daysRemaining}d left`;
}
