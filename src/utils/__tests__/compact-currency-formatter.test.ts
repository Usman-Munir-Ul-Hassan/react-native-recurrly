import {
  formatCompactNumber,
  formatCompactPrice,
} from "../compact-currency-formatter";

describe("compact-currency-formatter", () => {
  describe("formatCompactNumber", () => {
    it("formats standard amounts under 1,000 with two decimal places", () => {
      expect(formatCompactNumber(12.99)).toBe("12.99");
      expect(formatCompactNumber(0)).toBe("0");
      expect(formatCompactNumber(499.5)).toBe("499.50");
    });

    it("formats thousands with K suffix", () => {
      expect(formatCompactNumber(1000)).toBe("1K");
      expect(formatCompactNumber(1500)).toBe("1.5K");
      expect(formatCompactNumber(25000)).toBe("25K");
      expect(formatCompactNumber(150400)).toBe("150.4K");
    });

    it("formats millions with M suffix", () => {
      expect(formatCompactNumber(1000000)).toBe("1M");
      expect(formatCompactNumber(1500000)).toBe("1.5M");
      expect(formatCompactNumber(25400000)).toBe("25.4M");
    });

    it("formats billions with B suffix", () => {
      expect(formatCompactNumber(1000000000)).toBe("1B");
      expect(formatCompactNumber(2500000000)).toBe("2.5B");
    });

    it("handles negative numbers", () => {
      expect(formatCompactNumber(-1500)).toBe("-1.5K");
      expect(formatCompactNumber(-2000000)).toBe("-2M");
    });
  });

  describe("formatCompactPrice", () => {
    it("formats USD price with compact notation and optional cadence suffix", () => {
      expect(formatCompactPrice(15.99, "USD", "/mo")).toBe("$15.99/mo");
      expect(formatCompactPrice(1500000, "USD", "/mo")).toBe("$1.5M/mo");
      expect(formatCompactPrice(25000, "USD")).toBe("$25K");
    });

    it("formats with other currency symbols (PKR, EUR, GBP)", () => {
      expect(formatCompactPrice(500000, "PKR", "/mo")).toBe("Rs 500K/mo");
      expect(formatCompactPrice(1200000, "EUR", "/yr")).toBe("€1.2M/yr");
      expect(formatCompactPrice(10000, "GBP")).toBe("£10K");
    });
  });
});
