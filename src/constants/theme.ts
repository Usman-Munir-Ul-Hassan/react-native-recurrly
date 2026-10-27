/**
 * Chronicle Design System Tokens
 * Source: DESIGN.md & Stitch Visuals
 * Achromatic, sharp 4px/8px radii, tight typography.
 */

export const Colors = {
  // Canvas & Surfaces
  cloud: "#FFFFFF",
  limestone: "#F3F3F3",
  
  // Borders & Lines
  fog: "#E2E2E2",
  silver: "#B3B3B3",
  
  // Text & Content
  pitchBlack: "#050505",
  midnight: "#000000",
  charcoal: "#151515",
  obsidian: "#292929",
  graphite: "#6B6B6B",
  pewter: "#7E7E7E",
  ash: "#929292",

  // Brand Palette: #6FD776, #F9EB8D, #5E1B68, #34615B
  mint: "#6FD776",
  mintTint: "#EAF9EB",
  butter: "#F9EB8D",
  butterTint: "#FEFCEE",
  plum: "#5E1B68",
  plumTint: "#F6ECF7",
  forest: "#34615B",
  forestTint: "#EDF3F2",

  // Warm Editorial Canvas & Surfaces (Matching Reference)
  canvas: "#F9F6EE",
  surface: "#FFFFFF",
  cardBorder: "#EBE5D8",
  iconBackdrop: "#F4EFE6",

  // Unified Semantic Actions & Badges
  action: "#111827",
  badgeBg: "#F4EFE6",
  badgeBorder: "#EBE5D8",
  liveDot: "#16A34A",
};

export const Radius = {
  tag: 4,
  input: 4,
  button: 4,
  checkbox: 4,
  card: 8,
};

export interface CardTheme {
  bg: string;
  borderColor: string;
  textColor: string;
  subtextColor: string;
  iconBg: string;
}

export function getSemanticCardTheme(sub?: {
  daysRemaining?: number;
  amountNumeric?: number;
  category?: string;
}): CardTheme {
  return {
    bg: "#FFFFFF",
    borderColor: "#EBE5D8",
    textColor: "#111827",
    subtextColor: "#6B7280",
    iconBg: "#F4EFE6",
  };
}

export const Typography = {
  display: {
    fontSize: 28,
    fontWeight: "700" as const,
    letterSpacing: -0.8,
    color: Colors.pitchBlack,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "400" as const,
    lineHeight: 22,
    color: Colors.graphite,
  },
  label: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.charcoal,
  },
  body: {
    fontSize: 14,
    fontWeight: "400" as const,
    color: Colors.pitchBlack,
  },
  caption: {
    fontSize: 12,
    fontWeight: "400" as const,
    color: Colors.graphite,
  },
};
