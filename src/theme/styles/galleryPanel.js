import { PHONE, TINY_PORTRAIT } from "../breakpoints.js";

/**
 * MUI styles for the snapshots panel (GalleryPanel): its padded wrapper, header
 * row, count pill, close button, empty state and the responsive photo grid.
 */
export const galleryPanelStyles = {
  wrapper: {
    width: "100%",
    maxHeight: "100%",
    p: { xs: 1.75, sm: 2.625 },
    [PHONE]: { p: 1.5 },
    [TINY_PORTRAIT]: { p: 1.125 },
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 1.5,
    mb: 2,
    p: 0,
    [PHONE]: { mb: 1.5, gap: 1 },
  },
  kicker: {
    mb: 0.5,
    color: "#e9b69a",
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: "1.5px",
    [PHONE]: { fontSize: 9 },
  },
  title: {
    m: 0,
    color: "#fffaf7",
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: 23,
    fontWeight: 400,
    [PHONE]: { fontSize: 24 },
  },
  headerActions: { display: "flex", alignItems: "center", gap: 1 },
  countPill: {
    px: 1.25,
    py: 0.875,
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "99px",
    color: "rgba(255,250,247,0.6)",
    fontSize: 9,
    [PHONE]: { px: 1, py: 0.75, fontSize: 11 },
  },
  closeButton: {
    width: 32,
    height: 32,
    border: "1px solid rgba(255,255,255,0.14)",
    backgroundColor: "rgba(255,255,255,0.06)",
    color: "#fffaf7",
    fontSize: 20,
    "&:hover": { backgroundColor: "rgba(255,255,255,0.12)" },
    [PHONE]: { width: 44, height: 44, fontSize: 24 },
  },
  empty: {
    display: "flex",
    minHeight: 140,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 0.875,
    border: "1px dashed rgba(255,255,255,0.15)",
    borderRadius: "11px",
    color: "rgba(255,250,247,0.58)",
    textAlign: "center",
    [PHONE]: { minHeight: 180, p: 2 },
  },
  emptyGlyph: { color: "#e9b69a", fontSize: 25 },
  emptyTitle: {
    color: "rgba(255,250,247,0.83)",
    fontSize: 11,
    fontWeight: 600,
    [PHONE]: { fontSize: 14 },
  },
  emptyDetail: {
    color: "rgba(255,250,247,0.46)",
    fontSize: 10,
    [PHONE]: { fontSize: 12 },
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(185px, 1fr))",
    gap: 1.625,
    [PHONE]: {
      gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
      gap: 1,
    },
  },
};

/** Shared base styling for the Download / Remove buttons on a gallery card. */
export const galleryButtonStyles = {
  minHeight: 30,
  px: 1.125,
  borderRadius: "7px",
  fontSize: 9,
  fontWeight: 600,
  transition: "background 150ms ease",
  "&:focus-visible": { outline: "2px solid #f4c66d", outlineOffset: 3 },
  [PHONE]: { minHeight: 44, px: 1, fontSize: 12 },
};
