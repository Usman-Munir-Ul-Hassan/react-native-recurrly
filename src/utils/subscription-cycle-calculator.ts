export interface CycleCalculationResult {
  startDate: string; // YYYY-MM-DD
  renewalDate: string; // YYYY-MM-DD
  startDateFormatted: string; // e.g. "October 18, 2026"
  renewalDateShort: string; // e.g. "Renews Nov 18"
  nextRenewalFull: string; // e.g. "November 18, 2026 (in 15 days)"
  daysRemaining: number;
  cadenceText: string; // e.g. "in 15 days"
}

export interface CalculateCycleOptions {
  startDateInput?: string | Date;
  renewalDateInput?: string | Date;
  cadence?: "Monthly" | "Yearly";
  referenceToday?: Date;
}

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const MONTHS_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/**
 * Converts a Date to standard YYYY-MM-DD string.
 */
export function toIsoDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Safely parses a Date from string or Date object.
 */
export function parseDateSafe(input?: string | Date, fallback: Date = new Date()): Date {
  if (!input) return fallback;
  if (input instanceof Date && !isNaN(input.getTime())) return input;

  if (typeof input === "string") {
    const parts = input.trim().split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const parsed = new Date(year, month, day);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    const genericParsed = new Date(input);
    if (!isNaN(genericParsed.getTime())) return genericParsed;
  }

  return fallback;
}

/**
 * Calculates the next renewal date and real days remaining based on flexible
 * cycle start date, cadence, and optional custom renewal end date.
 */
export function calculateSubscriptionCycle(
  options?: CalculateCycleOptions
): CycleCalculationResult {
  const today = options?.referenceToday ?? new Date();
  const startOfDayToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const cadence = options?.cadence ?? "Monthly";
  const startDate = parseDateSafe(options?.startDateInput, startOfDayToday);

  let nextRenewal: Date;

  if (options?.renewalDateInput) {
    // User explicitly customized the ending renewal date
    nextRenewal = parseDateSafe(options.renewalDateInput, new Date(startDate.getTime() + 30 * 86400000));
  } else {
    // Automatically project the renewal date from the starting date
    nextRenewal = new Date(startDate);

    if (cadence === "Yearly") {
      // Advance by 1 year until it is in the future relative to today
      while (nextRenewal.getTime() <= startOfDayToday.getTime()) {
        nextRenewal.setFullYear(nextRenewal.getFullYear() + 1);
      }
    } else {
      // Advance by 1 month until it is in the future relative to today
      while (nextRenewal.getTime() <= startOfDayToday.getTime()) {
        nextRenewal.setMonth(nextRenewal.getMonth() + 1);
      }
    }
  }

  const startOfDayRenewal = new Date(
    nextRenewal.getFullYear(),
    nextRenewal.getMonth(),
    nextRenewal.getDate()
  );

  const diffMs = startOfDayRenewal.getTime() - startOfDayToday.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  let cadenceText = `in ${daysRemaining} days`;
  if (daysRemaining === 0) cadenceText = "today";
  else if (daysRemaining === 1) cadenceText = "tomorrow";

  const startMonth = MONTHS_FULL[startDate.getMonth()];
  const startDay = startDate.getDate();
  const startYear = startDate.getFullYear();
  const startDateFormatted = `${startMonth} ${startDay}, ${startYear}`;

  const renewalMonthShort = MONTHS_SHORT[nextRenewal.getMonth()];
  const renewalMonthFull = MONTHS_FULL[nextRenewal.getMonth()];
  const renewalDay = nextRenewal.getDate();
  const renewalYear = nextRenewal.getFullYear();

  const renewalDateShort = `Renews ${renewalMonthShort} ${renewalDay}`;
  const nextRenewalFull = `${renewalMonthFull} ${renewalDay}, ${renewalYear} (${cadenceText})`;

  return {
    startDate: toIsoDateString(startDate),
    renewalDate: toIsoDateString(nextRenewal),
    startDateFormatted,
    renewalDateShort,
    nextRenewalFull,
    daysRemaining,
    cadenceText,
  };
}
