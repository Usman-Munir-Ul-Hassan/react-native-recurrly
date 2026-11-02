import {
  validateSubscriptionForm,
  generateInitials,
  buildNewSubscription,
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
  });
});
