import {
  validateSubscriptionForm,
  generateInitials,
  buildNewSubscription,
  buildUpdatedSubscription,
} from "../subscription-form-validator";

describe("subscription-form-validator", () => {
  describe("validateSubscriptionForm", () => {
    it("returns valid when name and price are correctly supplied", () => {
      const result = validateSubscriptionForm("Spotify", "9.99");
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it("returns error when name is empty or only whitespace", () => {
      const result = validateSubscriptionForm("   ", "12.50");
      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBe("Subscription name is required.");
    });

    it("returns error when price is invalid, zero, or negative", () => {
      const zeroResult = validateSubscriptionForm("Netflix", "0");
      expect(zeroResult.isValid).toBe(false);
      expect(zeroResult.errors.price).toBe("Enter a valid positive price.");

      const invalidResult = validateSubscriptionForm("Netflix", "abc");
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors.price).toBe("Enter a valid positive price.");

      const emptyPriceResult = validateSubscriptionForm("Netflix", "");
      expect(emptyPriceResult.isValid).toBe(false);
      expect(emptyPriceResult.errors.price).toBe("Enter a valid positive price.");
    });

    it("accepts prices prefixed with currency symbols", () => {
      const result = validateSubscriptionForm("Apple One", "$19.95");
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });
  });

  describe("generateInitials", () => {
    it("extracts 2 characters for single-word names", () => {
      expect(generateInitials("Spotify")).toBe("SP");
      expect(generateInitials("Netflix")).toBe("NE");
    });

    it("extracts first character of first two words", () => {
      expect(generateInitials("GitHub Copilot")).toBe("GC");
      expect(generateInitials("Claude Pro Max")).toBe("CP");
    });

    it("handles fallback for empty names", () => {
      expect(generateInitials("")).toBe("SB");
    });
  });

  describe("buildNewSubscription", () => {
    it("builds a fully populated subscription object with computed renewal dates", () => {
      const customDate = new Date(2026, 10, 1); // Nov 1, 2026
      const sub = buildNewSubscription(
        {
          name: "Linear",
          price: "12.00",
          category: "Dev Tools",
        },
        { customDate }
      );

      expect(sub.name).toBe("Linear");
      expect(sub.initials).toBe("LI");
      expect(sub.logoUrl).toBe("https://www.google.com/s2/favicons?domain=linear.app&sz=128");
      expect(sub.category).toBe("Dev Tools");
      expect(sub.amountNumeric).toBe(12.0);
      expect(sub.price).toBe("$12.00/mo");
      expect(sub.status).toBe("Active");
      expect(sub.daysRemaining).toBe(30);
      expect(sub.renewalDateShort).toBe("Renews Dec 1");
      expect(sub.nextRenewalFull).toContain("December 1, 2026");
      expect(sub.billingCycle).toBe("Monthly (renews automatically)");
      expect(sub.id).toMatch(/^sub-\d+-linear$/);
    });

    it("builds yearly subscription with 365 days and /yr suffix", () => {
      const customDate = new Date(2026, 0, 1); // Jan 1, 2026
      const sub = buildNewSubscription(
        {
          name: "Annual Cloud",
          price: "120.00",
          category: "Dev Tools",
          billingCadence: "Yearly",
          currencySymbol: "€",
        },
        { customDate }
      );

      expect(sub.price).toBe("€120.00/yr");
      expect(sub.daysRemaining).toBe(365);
      expect(sub.billingCycle).toBe("Yearly (renews automatically)");
    });

    it("supports custom start date from previous month and calculates renewal", () => {
      // Today is Nov 3, 2026. Started on Oct 18, 2026.
      const referenceToday = new Date(2026, 10, 3);
      const sub = buildNewSubscription(
        {
          name: "Netflix",
          price: "15.99",
          category: "Entertainment",
          billingCadence: "Monthly",
          startDate: "2026-10-18",
        },
        { customDate: referenceToday }
      );

      expect(sub.startDate).toBe("2026-10-18");
      expect(sub.renewalDate).toBe("2026-11-18");
      expect(sub.daysRemaining).toBe(15);
      expect(sub.renewalDateShort).toBe("Renews Nov 18");
    });
  });

  describe("buildUpdatedSubscription", () => {
    it("updates price, cadence, and recalculates cycle while preserving ID", () => {
      const existing = buildNewSubscription({
        name: "Spotify",
        price: "9.99",
        category: "Entertainment",
        billingCadence: "Monthly",
        startDate: "2026-10-18",
      });

      const updated = buildUpdatedSubscription({
        existing,
        name: "Spotify Duo",
        price: "14.99",
        category: "Entertainment",
        cadence: "Monthly",
        paymentMethod: "Apple Pay",
        startDate: "2026-10-18",
      });

      expect(updated.id).toBe(existing.id);
      expect(updated.name).toBe("Spotify Duo");
      expect(updated.amountNumeric).toBe(14.99);
      expect(updated.price).toBe("$14.99/mo");
      expect(updated.paymentMethod).toBe("Apple Pay");
      expect(updated.startDate).toBe("2026-10-18");
    });
  });
});
