import {
  convertCurrency,
  FALLBACK_RATES,
  fetchLiveExchangeRates,
  formatPriceWithCadence,
} from "../exchange-rate-service";

describe("exchange-rate-service", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  describe("convertCurrency", () => {
    it("converts USD amounts correctly using provided rates", () => {
      const customRates = {
        USD: 1.0,
        EUR: 0.9,
        GBP: 0.8,
        PKR: 280,
        CAD: 1.35,
        INR: 83.0,
      };

      expect(convertCurrency(10, "EUR", customRates)).toBe(9.0);
      expect(convertCurrency(10, "GBP", customRates)).toBe(8.0);
      expect(convertCurrency(10, "PKR", customRates)).toBe(2800);
      expect(convertCurrency(10, "USD", customRates)).toBe(10);
    });

    it("uses fallback rates when rates argument is omitted", () => {
      expect(convertCurrency(10, "USD")).toBe(10);
      expect(convertCurrency(10, "EUR")).toBeCloseTo(9.2, 1);
    });

    it("returns exact amount when fromCurrency matches targetCurrency (e.g. PKR to PKR)", () => {
      const customRates = { ...FALLBACK_RATES, PKR: 280 };
      expect(convertCurrency(3555, "PKR", customRates, "PKR")).toBe(3555);
    });

    it("converts between non-USD currencies using cross rate", () => {
      const customRates = { USD: 1.0, EUR: 0.9, PKR: 270, GBP: 0.8, CAD: 1.35, INR: 83.0 };
      expect(convertCurrency(2700, "EUR", customRates, "PKR")).toBeCloseTo(9.0, 1);
    });
  });

  describe("formatPriceWithCadence", () => {
    it("formats converted amount with symbol and cadence suffix", () => {
      const customRates = { ...FALLBACK_RATES, EUR: 0.92, PKR: 278 };

      expect(formatPriceWithCadence(10, "EUR", customRates, "/mo")).toBe("€9.20/mo");
      expect(formatPriceWithCadence(100, "PKR", customRates, "/yr")).toBe("Rs 27800.00/yr");
    });
  });

  describe("fetchLiveExchangeRates", () => {
    it("parses live rates when API responds successfully", async () => {
      const mockApiResponse = {
        result: "success",
        rates: {
          USD: 1.0,
          EUR: 0.95,
          GBP: 0.82,
          PKR: 282.5,
          CAD: 1.38,
          INR: 84.1,
        },
      };

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      });

      const rates = await fetchLiveExchangeRates();

      expect(rates.EUR).toBe(0.95);
      expect(rates.GBP).toBe(0.82);
      expect(rates.PKR).toBe(282.5);
    });

    it("falls back to default fallback rates when API call fails or times out", async () => {
      global.fetch = jest.fn().mockRejectedValueOnce(new Error("Network offline"));

      const rates = await fetchLiveExchangeRates();

      expect(rates).toEqual(FALLBACK_RATES);
    });
  });
});
