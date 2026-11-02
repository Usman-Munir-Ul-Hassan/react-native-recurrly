/**
 * Dictionary of popular software, streaming, and tool domains with non-.com or special domains.
 */
const KNOWN_DOMAINS: Record<string, string> = {
  chatgpt: "chatgpt.com",
  openai: "openai.com",
  claude: "claude.ai",
  anthropic: "anthropic.com",
  notion: "notion.so",
  spotify: "spotify.com",
  netflix: "netflix.com",
  github: "github.com",
  figma: "figma.com",
  dropbox: "dropbox.com",
  linear: "linear.app",
  slack: "slack.com",
  discord: "discord.com",
  youtube: "youtube.com",
  prime: "amazon.com",
  amazon: "amazon.com",
  hulu: "hulu.com",
  disney: "disneyplus.com",
  hbo: "max.com",
  max: "max.com",
  apple: "apple.com",
  google: "google.com",
  microsoft: "microsoft.com",
  adobe: "adobe.com",
  canva: "canva.com",
  coursera: "coursera.org",
  udemy: "udemy.com",
  duolingo: "duolingo.com",
  midjourney: "midjourney.com",
  twitter: "x.com",
  x: "x.com",
  twitch: "twitch.tv",
  cursor: "cursor.com",
  vercel: "vercel.com",
  supabase: "supabase.com",
};

/**
 * Resolves a company or service name to its likely domain.
 */
export function resolveDomain(name: string): string | null {
  const clean = name.trim().toLowerCase();
  if (!clean) return null;

  // If the user already typed a domain like 'cursor.com' or 'claude.ai'
  if (clean.includes(".") && !clean.includes(" ")) {
    return clean.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  }

  // Check dictionary for full name
  if (KNOWN_DOMAINS[clean]) {
    return KNOWN_DOMAINS[clean];
  }

  // Check dictionary for first word (e.g. "Spotify Premium" -> "spotify")
  const firstWord = clean.split(/\s+/)[0];
  if (KNOWN_DOMAINS[firstWord]) {
    return KNOWN_DOMAINS[firstWord];
  }

  // Generic fallback: alphanumeric word + .com
  const slug = clean.replace(/[^a-z0-9]/g, "");
  if (slug.length >= 2) {
    return `${slug}.com`;
  }

  return null;
}

/**
 * Generates the Google Public Favicon HD URL for a given brand name.
 * 100% free, zero authentication or API keys required.
 */
export function resolveBrandIconUrl(name: string): string | undefined {
  const domain = resolveDomain(name);
  if (!domain) return undefined;
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}
