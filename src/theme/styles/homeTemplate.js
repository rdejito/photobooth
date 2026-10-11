/**
 * MUI styles for the Home page shell (HomeTemplate): the full-height page,
 * the two-column hero grid and the footer strip.
 */

/** Page shell: full-height dark column with responsive gutters. */
export const homeShellStyles = {
  position: "relative",
  display: "flex",
  minHeight: "100vh",
  flexDirection: "column",
  overflow: "hidden",
  px: "clamp(22px, 7vw, 104px)",
  color: "#fffaf7",
  backgroundColor: "#1f2023",
  "@media (max-width: 850px)": { px: "clamp(20px, 6vw, 52px)" },
  "@media (max-width: 680px)": {
    minHeight: "100svh",
    overflow: "visible",
    px: "clamp(16px, 5vw, 24px)",
  },
  "@media (max-width: 390px)": { px: 2 },
  "@media (max-width: 850px) and (min-width: 681px)": {
    minHeight: "100svh",
    overflow: "visible",
    px: "clamp(28px, 6vw, 56px)",
  },
  "@media (max-height: 720px) and (min-width: 851px)": { minHeight: "100vh" },
};

/** Hero: copy beside the join card, collapsing to a column on small screens. */
export const homeHeroStyles = {
  zIndex: 1,
  display: "grid",
  width: "min(1120px, 100%)",
  flex: 1,
  gridTemplateColumns: "minmax(0, 1fr) minmax(360px, 440px)",
  alignItems: "center",
  gap: "clamp(38px, 8vw, 112px)",
  mx: "auto",
  padding: "46px 0 64px",
  "@media (max-width: 850px)": {
    gridTemplateColumns: "minmax(0, 1fr) minmax(320px, 390px)",
    gap: 3.5,
  },
  "@media (max-width: 850px) and (min-width: 681px)": {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    gap: 3,
    padding: "35px 0 40px",
  },
  "@media (max-width: 680px)": {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    gap: 0,
    padding: "30px 0 28px",
  },
  "@media (max-height: 720px) and (min-width: 851px)": { padding: "22px 0 30px" },
  "@media (min-width: 1440px)": {
    width: "min(1320px, 100%)",
    gridTemplateColumns: "minmax(0, 1fr) minmax(400px, 480px)",
    gap: "clamp(72px, 8vw, 140px)",
  },
};

/** Footer: a centred hairline-separated note. */
export const homeFooterStyles = {
  display: "flex",
  minHeight: 52,
  alignItems: "center",
  justifyContent: "center",
  gap: 1.25,
  borderTop: "1px solid rgba(255,255,255,0.08)",
  color: "rgba(255,250,247,0.4)",
  fontSize: 10,
  letterSpacing: 0.2,
  "@media (max-width: 680px)": { minHeight: 48, fontSize: 9 },
  "@media (max-width: 390px)": { gap: 0.75, fontSize: 8 },
};
