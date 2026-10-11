/**
 * MUI styles for the booth header (BoothHeader): the brand lockup and the
 * connection-count pill.
 */
export const boothHeaderStyles = {
  header: {
    display: "flex",
    minHeight: 54,
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid rgba(255,255,255,0.09)",
    "@media (max-width: 640px)": { minHeight: 48 },
  },
  brand: {
    display: "inline-flex",
    alignItems: "center",
    gap: 1.25,
    color: "#fffaf7",
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: 18,
    "@media (max-width: 640px)": { gap: 0.875, fontSize: 14 },
    "@media (max-width: 380px)": { gap: 0.75 },
  },
  brandMark: {
    display: "grid",
    width: 34,
    height: 30,
    placeItems: "center",
    border: "1px solid rgba(255,208,170,0.4)",
    borderRadius: "9px",
    color: "#ffc59d",
    backgroundColor: "rgba(233,167,127,0.09)",
    "& svg": { width: 22, height: 19 },
    "@media (max-width: 380px)": { width: 29, "& svg": { width: 19 } },
  },
};

/** The connection-count pill (ConnectionPill). */
export const connectionPillStyles = {
  display: "inline-flex",
  alignItems: "center",
  gap: 1,
  px: 1.5,
  py: 1,
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "99px",
  backgroundColor: "rgba(255,255,255,0.035)",
  color: "rgba(255,250,247,0.65)",
  fontSize: 11,
  "&[data-connected='true'] .connection-dot": {
    backgroundColor: "#c9dfb2",
    boxShadow: "0 0 10px rgba(201,223,178,0.65)",
  },
  "@media (max-width: 640px)": { maxWidth: 142, px: 1, py: 0.75, fontSize: 8 },
};

// The connection dot itself is a StatusDot atom rendered inside the pill; the
// "connected" state swaps its colour via the `.connection-dot` class below.
