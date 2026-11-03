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
/**
 * Safely adds months to a base date, clamping the day of the month
 * to the last valid day of the target month (e.g. Jan 31 + 1 mo -> Feb 28/29,
 * and Jan 31 + 2 mo -> Mar 31), preventing month-end and leap-year drift.
 */
export function addMonthsClamped(baseDate: Date, monthsToAdd: number): Date {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth() + monthsToAdd;
  const day = baseDate.getDate();

  const targetDate = new Date(year, month, 1);
  const targetYear = targetDate.getFullYear();
  const targetMonth = targetDate.getMonth();

  const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
  const clampedDay = Math.min(day, daysInMonth);

  return new Date(targetYear, targetMonth, clampedDay);
}

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
    // Automatically project the renewal date from the starting date using clamped addition
    if (cadence === "Yearly") {
      let yearsAdded = 0;
      nextRenewal = startDate;
      while (nextRenewal.getTime() <= startOfDayToday.getTime()) {
        yearsAdded += 1;
        nextRenewal = addMonthsClamped(startDate, yearsAdded * 12);
      }
    } else {
      let monthsAdded = 0;
      nextRenewal = startDate;
      while (nextRenewal.getTime() <= startOfDayToday.getTime()) {
        monthsAdded += 1;
        nextRenewal = addMonthsClamped(startDate, monthsAdded);
      }
    }
  }

  const startOfDayRenewal = new Date(
    nextRenewal.getFullYear(),
    nextRenewal.getMonth(),
    nextRenewal.getDate()
  );

  const diffMs = startOfDayRenewal.getTime() - startOfDayToday.getTime();
  const daysRemaining = Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));

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
