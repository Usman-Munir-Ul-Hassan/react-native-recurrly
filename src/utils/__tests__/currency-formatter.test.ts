import {
  formatCurrencyAmount,
  getCurrencySymbol,
  SUPPORTED_CURRENCIES,
} from "../currency-formatter";

describe("currency-formatter", () => {
  describe("getCurrencySymbol", () => {
    it("returns correct symbol for each supported currency", () => {
      expect(getCurrencySymbol("USD")).toBe("$");
      expect(getCurrencySymbol("EUR")).toBe("€");
      expect(getCurrencySymbol("GBP")).toBe("£");
      expect(getCurrencySymbol("PKR")).toBe("Rs ");
      expect(getCurrencySymbol("CAD")).toBe("C$");
      expect(getCurrencySymbol("INR")).toBe("₹");
    });

    it("falls back to $ for unknown codes", () => {
      // @ts-expect-error Testing fallback
      expect(getCurrencySymbol("UNKNOWN")).toBe("$");
    });
  });

  describe("formatCurrencyAmount", () => {
    it("formats amount with USD by default", () => {
      expect(formatCurrencyAmount(15)).toBe("$15.00");
      expect(formatCurrencyAmount(10.5)).toBe("$10.50");
    });

    it("formats amount with different currencies", () => {
      expect(formatCurrencyAmount(29.99, "EUR")).toBe("€29.99");
      expect(formatCurrencyAmount(120, "GBP")).toBe("£120.00");
      expect(formatCurrencyAmount(2500, "PKR")).toBe("Rs 2500.00");
    });

    it("safely handles NaN amounts", () => {
      expect(formatCurrencyAmount(NaN, "USD")).toBe("$0.00");
    });
  });

  describe("SUPPORTED_CURRENCIES", () => {
    it("includes major international currencies", () => {
      const codes = SUPPORTED_CURRENCIES.map((c) => c.code);
      expect(codes).toEqual(["USD", "EUR", "GBP", "PKR", "CAD", "INR"]);
    });
  });
});
