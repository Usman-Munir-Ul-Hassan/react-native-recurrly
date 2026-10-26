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
};

export const Radius = {
  tag: 4,
  input: 4,
  button: 4,
  checkbox: 4,
  card: 8,
};

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
