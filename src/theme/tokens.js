/**
 * Shared design tokens for the photobooth UI.
 *
 * These values are the recurring colours, surfaces and type stacks used by the
 * booth screens. Centralising them here means a palette tweak happens in one
 * place instead of being chased through dozens of `sx` objects. Component-level
 * MUI style objects live in `theme/styles/*` and reference these tokens.
 */

/** Core ink + paper colours. */
export const COLORS = {
  ink: "#171423",
  text: "#fffaf7",
  accent: "#e9b69a",
  accentStrong: "#e9a77f",
  gold: "#f4c66d",
  mutedText: "rgba(255,250,247,0.6)",
  softText: "rgba(255,250,247,0.48)",
};

/** Recurring translucent borders and surfaces on the dark booth background. */
export const SURFACES = {
  borderSoft: "rgba(255,255,255,0.12)",
  borderFaint: "rgba(255,255,255,0.09)",
  borderBright: "rgba(255,255,255,0.14)",
  raised: "rgba(255,255,255,0.045)",
  panelGradient: "linear-gradient(155deg, rgba(47,39,54,0.88), rgba(30,27,40,0.94))",
  stageGradient: "linear-gradient(145deg, rgba(47,39,54,0.9), rgba(30,27,40,0.94))",
  scrim: "rgba(16,14,23,0.92)",
};

/** Shared font stacks (body copy and the serif display face). */
export const FONTS = {
  body: '"Avenir Next", Avenir, "Segoe UI", sans-serif',
  serif: 'Georgia, "Times New Roman", serif',
};
