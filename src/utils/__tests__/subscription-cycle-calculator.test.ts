import {
  calculateSubscriptionCycle,
  toIsoDateString,
  parseDateSafe,
  addMonthsClamped,
} from "../subscription-cycle-calculator";

describe("subscription-cycle-calculator", () => {
  const referenceToday = new Date(2026, 10, 3); // Nov 3, 2026

  describe("addMonthsClamped", () => {
    it("clamps month-end dates when target month has fewer days", () => {
      const jan31 = new Date(2026, 0, 31);
      const feb = addMonthsClamped(jan31, 1);
      expect(feb.getFullYear()).toBe(2026);
      expect(feb.getMonth()).toBe(1); // February
      expect(feb.getDate()).toBe(28); // 2026 is non-leap year

      const mar = addMonthsClamped(jan31, 2);
      expect(mar.getFullYear()).toBe(2026);
      expect(mar.getMonth()).toBe(2); // March
      expect(mar.getDate()).toBe(31); // Preserves 31st
    });

    it("clamps August 31 to September 30 without slipping into October", () => {
      const aug31 = new Date(2026, 7, 31);
      const sep = addMonthsClamped(aug31, 1);
      expect(sep.getMonth()).toBe(8); // September
      expect(sep.getDate()).toBe(30);
    });
  });

  describe("toIsoDateString", () => {
    it("formats dates as YYYY-MM-DD", () => {
      const d = new Date(2026, 9, 18); // Oct 18, 2026
      expect(toIsoDateString(d)).toBe("2026-10-18");
    });
  });

  describe("parseDateSafe", () => {
    it("parses YYYY-MM-DD strings accurately without timezone shifts", () => {
      const d = parseDateSafe("2026-10-18");
      expect(d.getFullYear()).toBe(2026);
      expect(d.getMonth()).toBe(9); // 0-indexed October
      expect(d.getDate()).toBe(18);
    });
  });

  describe("calculateSubscriptionCycle", () => {
    it("calculates next renewal for subscription started last month (Oct 18 -> Nov 18)", () => {
      const result = calculateSubscriptionCycle({
        startDateInput: "2026-10-18",
        cadence: "Monthly",
        referenceToday,
      });

      expect(result.startDate).toBe("2026-10-18");
      expect(result.renewalDate).toBe("2026-11-18");
      expect(result.renewalDateShort).toBe("Renews Nov 18");
      expect(result.daysRemaining).toBe(15); // Nov 3 to Nov 18
      expect(result.cadenceText).toBe("in 15 days");
      expect(result.startDateFormatted).toBe("October 18, 2026");
    });

    it("advances automatically for subscriptions started months ago", () => {
      // Started in August, currently in November
      const result = calculateSubscriptionCycle({
        startDateInput: "2026-07-15", // Aug 15
        cadence: "Monthly",
        referenceToday,
      });

      // Next renewal should be Nov 15, 2026
      expect(result.renewalDate).toBe("2026-11-15");
      expect(result.daysRemaining).toBe(12); // Nov 3 to Nov 15
    });

    it("calculates next renewal for Yearly subscription", () => {
      const result = calculateSubscriptionCycle({
        startDateInput: "2026-05-10",
        cadence: "Yearly",
        referenceToday,
      });

      // Next renewal in May 2027
      expect(result.renewalDate).toBe("2027-05-10");
      expect(result.renewalDateShort).toBe("Renews May 10");
    });

    it("respects custom user-adjusted renewal date override", () => {
      const result = calculateSubscriptionCycle({
        startDateInput: "2026-10-18",
        renewalDateInput: "2026-11-25", // User adjusted ending date
        cadence: "Monthly",
        referenceToday,
      });

      expect(result.renewalDate).toBe("2026-11-25");
      expect(result.daysRemaining).toBe(22); // Nov 3 to Nov 25
      expect(result.renewalDateShort).toBe("Renews Nov 25");
    });

    it("treats future startDate as the first billing date for monthly cadence", () => {
      const result = calculateSubscriptionCycle({
        startDateInput: "2026-11-20",
        cadence: "Monthly",
        referenceToday,
      });

      // Since Nov 20 is after Nov 3, it is the first upcoming renewal
      expect(result.renewalDate).toBe("2026-11-20");
      expect(result.daysRemaining).toBe(17);
      expect(result.renewalDateShort).toBe("Renews Nov 20");
    });

    it("treats future startDate as the first billing date for yearly cadence", () => {
      const result = calculateSubscriptionCycle({
        startDateInput: "2027-02-15",
        cadence: "Yearly",
        referenceToday,
      });

      expect(result.renewalDate).toBe("2027-02-15");
      expect(result.renewalDateShort).toBe("Renews Feb 15");
    });

    it("formats 0 days remaining as 'today' and 1 day remaining as 'tomorrow'", () => {
      const todayResult = calculateSubscriptionCycle({
        renewalDateInput: "2026-11-03",
        referenceToday,
      });
      expect(todayResult.daysRemaining).toBe(0);
      expect(todayResult.cadenceText).toBe("today");

      const tomorrowResult = calculateSubscriptionCycle({
        renewalDateInput: "2026-11-04",
        referenceToday,
      });
      expect(tomorrowResult.daysRemaining).toBe(1);
      expect(tomorrowResult.cadenceText).toBe("tomorrow");
    });
  });
});
