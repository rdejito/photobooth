/**
 * MUI styles for the Home hero copy block (HomeHeroCopy): eyebrow, title,
 * description and the numbered "how it works" points.
 */
export const homeHeroCopyStyles = {
  copy: {
    maxWidth: 600,
    pb: 2.25,
    "@media (max-width: 850px) and (min-width: 681px)": { maxWidth: 680, p: 0 },
    "@media (max-width: 680px)": { p: 0 },
  },
  eyebrow: {
    display: "inline-flex",
    alignItems: "center",
    gap: 1.125,
    color: "#e9b69a",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 2,
    "& span": { color: "#f4c66d", fontSize: 16 },
    "@media (max-width: 390px)": { fontSize: 8, letterSpacing: 1.4 },
  },
  title: {
    margin: "22px 0 18px",
    color: "#fffaf7",
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: "clamp(48px, 6.3vw, 78px)",
    fontWeight: 400,
    letterSpacing: "-2.8px",
    lineHeight: 0.99,
    "& span": { color: "#f1b995", fontStyle: "italic" },
    "@media (max-width: 850px)": { fontSize: "clamp(44px, 7vw, 62px)" },
    "@media (max-width: 850px) and (min-width: 681px)": {
      mt: 2.125,
      mb: 1.625,
      fontSize: "clamp(48px, 7vw, 64px)",
    },
    "@media (max-width: 680px)": {
      mt: 2.125,
      fontSize: "clamp(42px, 11.5vw, 60px)",
      letterSpacing: "-2px",
    },
    "@media (max-width: 390px)": { fontSize: "clamp(39px, 11vw, 48px)" },
    "@media (max-height: 720px) and (min-width: 851px)": {
      mt: 2,
      mb: 1.5,
      fontSize: "clamp(46px, 5.5vw, 68px)",
    },
    "@media (min-width: 1440px)": { fontSize: "clamp(72px, 5.5vw, 92px)" },
  },
  description: {
    maxWidth: 450,
    m: 0,
    color: "rgba(255,250,247,0.67)",
    fontSize: 15,
    lineHeight: 1.85,
    "@media (max-width: 850px) and (min-width: 681px)": { maxWidth: 560, fontSize: 14 },
    "@media (max-width: 680px)": { maxWidth: 440, fontSize: 13, lineHeight: 1.65 },
  },
  points: {
    display: "flex",
    flexDirection: "column",
    gap: 2.125,
    mt: 4.125,
    "@media (max-width: 850px) and (min-width: 681px)": {
      display: "grid",
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      gap: 2.25,
      mt: 2.75,
    },
    "@media (max-width: 680px)": {
      display: "grid",
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      gap: 1.5,
      mt: 2.375,
    },
    "@media (max-width: 390px)": { gridTemplateColumns: "minmax(0, 1fr)", gap: 1.25 },
    "@media (max-height: 720px) and (min-width: 851px)": { gap: 1.5, mt: 2.875 },
  },
};

/** Styles for a single numbered point row. */
export const homePointStyles = {
  point: {
    display: "flex",
    alignItems: "center",
    gap: 1.625,
    "@media (max-width: 680px)": { alignItems: "flex-start", gap: 1 },
  },
  pointIcon: {
    display: "grid",
    width: 37,
    height: 37,
    flex: "0 0 auto",
    placeItems: "center",
    border: "1px solid rgba(244,198,109,0.2)",
    borderRadius: 3,
    backgroundColor: "rgba(244,198,109,0.07)",
    color: "#f4c66d",
    fontSize: 19,
    "@media (max-width: 680px)": { width: 30, height: 30, borderRadius: 2.25, fontSize: 16 },
  },
  pointTitle: {
    display: "block",
    color: "rgba(255,250,247,0.94)",
    fontSize: 12,
    fontWeight: 600,
    "@media (max-width: 680px)": { fontSize: 10 },
  },
  pointDescription: {
    display: "block",
    mt: 0.375,
    color: "rgba(255,250,247,0.48)",
    fontSize: 11,
    "@media (max-width: 680px)": { fontSize: 9, lineHeight: 1.4 },
  },
};
