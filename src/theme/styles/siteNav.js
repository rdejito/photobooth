/**
 * MUI styles for the Home page navigation bar (SiteNav): the brand lockup and
 * the "live" status note.
 */
export const siteNavStyles = {
  nav: {
    zIndex: 1,
    display: "flex",
    minHeight: 82,
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid rgba(255,255,255,0.09)",
    "@media (max-width: 850px) and (min-width: 681px)": { minHeight: 68 },
    "@media (max-width: 680px)": { minHeight: 62 },
    "@media (max-height: 720px) and (min-width: 851px)": { minHeight: 64 },
  },
  brand: {
    display: "inline-flex",
    alignItems: "center",
    gap: 1.25,
    color: "#fffaf7",
    fontSize: 17,
    fontWeight: 600,
    letterSpacing: "-0.5px",
    textDecoration: "none",
    "&:focus-visible": { outline: "2px solid #f4c66d", outlineOffset: 3 },
    "@media (max-width: 680px)": { gap: 1, fontSize: 15 },
    "@media (max-width: 390px)": { fontSize: 13 },
  },
  brandIcon: {
    display: "grid",
    width: 30,
    height: 30,
    placeItems: "center",
    border: "1px solid rgba(255,208,170,0.45)",
    borderRadius: "9px",
    color: "#ffc59d",
    fontSize: 18,
    "& svg": { width: 21, height: 18 },
  },
  navNote: {
    display: "flex",
    alignItems: "center",
    gap: 1.125,
    color: "rgba(255,250,247,0.58)",
    fontSize: 12,
    "@media (max-width: 680px)": { maxWidth: 138, fontSize: 9 },
    "@media (max-width: 390px)": { maxWidth: 118, gap: 0.75, fontSize: 8 },
  },
  // The live dot itself is a StatusDot atom sized/coloured by SiteNav.
};
