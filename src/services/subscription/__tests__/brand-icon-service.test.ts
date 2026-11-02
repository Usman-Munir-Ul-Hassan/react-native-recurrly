import {
  resolveDomain,
  resolveBrandIconUrl,
} from "../brand-icon-service";

describe("brand-icon-service", () => {
  describe("resolveDomain", () => {
    it("resolves popular services with special domains", () => {
      expect(resolveDomain("ChatGPT")).toBe("chatgpt.com");
      expect(resolveDomain("Claude")).toBe("claude.ai");
      expect(resolveDomain("Notion")).toBe("notion.so");
      expect(resolveDomain("Coursera")).toBe("coursera.org");
    });

    it("resolves multi-word brand names from first word", () => {
      expect(resolveDomain("Spotify Premium")).toBe("spotify.com");
      expect(resolveDomain("Netflix Ultra HD")).toBe("netflix.com");
      expect(resolveDomain("GitHub Copilot")).toBe("github.com");
    });

    it("accepts direct domain input with or without protocols", () => {
      expect(resolveDomain("cursor.com")).toBe("cursor.com");
      expect(resolveDomain("https://linear.app/pricing")).toBe("linear.app");
    });

    it("falls back to .com for standard brand names", () => {
      expect(resolveDomain("Duolingo")).toBe("duolingo.com");
      expect(resolveDomain("Hulu")).toBe("hulu.com");
    });

    it("returns null for empty or invalid names", () => {
      expect(resolveDomain("")).toBeNull();
      expect(resolveDomain(" ")).toBeNull();
      expect(resolveDomain("a")).toBeNull();
    });
  });

  describe("resolveBrandIconUrl", () => {
    it("generates a Google Public Favicon HD URL for valid brand", () => {
      const url = resolveBrandIconUrl("Spotify");
      expect(url).toBe("https://www.google.com/s2/favicons?domain=spotify.com&sz=128");
    });

    it("returns undefined when domain cannot be determined", () => {
      expect(resolveBrandIconUrl("")).toBeUndefined();
    });
  });
});
