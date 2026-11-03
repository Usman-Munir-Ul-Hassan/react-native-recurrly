import {
  calculateSimilarity,
  isFuzzyMatch,
  levenshteinDistance,
} from "@/utils/fuzzy-matcher";

describe("fuzzy-matcher", () => {
  describe("levenshteinDistance", () => {
    it("returns 0 for identical strings regardless of case and whitespace", () => {
      expect(levenshteinDistance("Netflix", "netflix")).toBe(0);
      expect(levenshteinDistance(" Google Cloud ", "google cloud")).toBe(0);
    });

    it("calculates 1 edit distance for single-letter typos", () => {
      // 1 substitution: 'a' vs 'u'
      expect(levenshteinDistance("Google Cloud", "Google Cload")).toBe(1);
      // 1 insertion: extra 'l'
      expect(levenshteinDistance("Netflix", "Netfllix")).toBe(1);
      // 1 deletion: missing 'i'
      expect(levenshteinDistance("Spotify", "Spotfy")).toBe(1);
    });

    it("returns length of non-empty string when compared with empty", () => {
      expect(levenshteinDistance("", "Apple")).toBe(5);
      expect(levenshteinDistance("Apple", "")).toBe(5);
    });
  });

  describe("calculateSimilarity", () => {
    it("returns 1.0 for identical strings", () => {
      expect(calculateSimilarity("Spotify", "Spotify")).toBe(1.0);
    });

    it("returns 0.0 when one string is empty", () => {
      expect(calculateSimilarity("", "Hulu")).toBe(0.0);
    });

    it("computes accurate percentage for typos", () => {
      // 1 typo in 12 chars: 1 - 1/12 = ~0.9167 (91.7%)
      const cloudSim = calculateSimilarity("Google Cloud", "Google Cload");
      expect(cloudSim).toBeGreaterThan(0.9);
      expect(cloudSim).toBeLessThan(0.95);

      // Completely different strings
      expect(calculateSimilarity("Netflix", "Disney+")).toBeLessThan(0.3);
    });
  });

  describe("isFuzzyMatch", () => {
    it("identifies common typos as matches at 85% threshold", () => {
      expect(isFuzzyMatch("Google Cloud", "Google Cload")).toBe(true);
      expect(isFuzzyMatch("Netflix", "Netfllix")).toBe(true);
      expect(isFuzzyMatch("Spotify", "Spotfy")).toBe(true);
    });

    it("rejects genuinely different services", () => {
      expect(isFuzzyMatch("Netflix", "Spotify")).toBe(false);
      expect(isFuzzyMatch("Amazon Prime", "Apple Music")).toBe(false);
      expect(isFuzzyMatch("GitHub", "GitLab")).toBe(false); // 2 edits out of 6 -> ~67%
    });
  });
});
