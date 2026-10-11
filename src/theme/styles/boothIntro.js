/**
 * MUI styles for the booth intro band (BoothIntro) and the room-code card
 * (RoomCodeCard) it contains.
 */
export const boothIntroStyles = {
  intro: {
    display: "flex",
    minHeight: 104,
    alignItems: "center",
    justifyContent: "space-between",
    gap: 3,
    py: 1.5,
    "@media (max-height: 720px) and (min-width: 641px)": { minHeight: 84, py: 0.875 },
    "@media (max-width: 640px)": {
      minHeight: 78,
      gap: 1.125,
      py: 0.875,
      "& > div:first-of-type": { minWidth: 0, flex: 1 },
    },
    "@media (max-width: 640px) and (orientation: portrait)": { minHeight: 78 },
    "@media (max-width: 640px) and (orientation: landscape) and (max-height: 500px)": {
      minHeight: 56,
      py: 0.5,
    },
    "@media (max-width: 360px) and (orientation: portrait)": { minHeight: 70 },
  },
  kicker: {
    mb: 1,
    color: "#e9b69a",
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: 1.8,
    "@media (max-width: 640px)": { mb: 0.5, fontSize: 8 },
    "@media (max-width: 640px) and (orientation: landscape) and (max-height: 500px)": {
      mb: 0.25,
    },
  },
  title: {
    m: 0,
    color: "#fffaf7",
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: "clamp(32px, 4vw, 45px)",
    fontWeight: 400,
    letterSpacing: "-1px",
    "@media (max-height: 720px) and (min-width: 641px)": {
      fontSize: "clamp(28px, 3.4vw, 38px)",
    },
    "@media (max-width: 640px)": { fontSize: "clamp(21px, 6vw, 30px)", letterSpacing: "-0.6px" },
    "@media (max-width: 640px) and (orientation: landscape) and (max-height: 500px)": {
      fontSize: 22,
    },
  },
  description: {
    mt: 1,
    mb: 0,
    color: "rgba(255,250,247,0.6)",
    fontSize: 12,
    lineHeight: 1.6,
    "@media (max-height: 720px) and (min-width: 641px)": { mt: 0.5, fontSize: 11 },
    "@media (max-width: 640px)": { display: "none" },
  },
};

/** Styles for the room-code card, including its embedded copy button. */
export const roomCodeCardStyles = {
  display: "flex",
  minWidth: 184,
  flexDirection: "column",
  gap: 0.375,
  px: 1.625,
  py: 1.125,
  border: "1px solid rgba(255,255,255,0.11)",
  borderRadius: "13px",
  backgroundColor: "rgba(255,255,255,0.045)",
  "& > span": { color: "#e9b69a", fontSize: 8, fontWeight: 700, letterSpacing: 1.5 },
  "& > strong": {
    color: "#fffaf7",
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: 20,
    fontWeight: 400,
    letterSpacing: 3,
    userSelect: "all",
  },
  "& > small": { color: "rgba(255,250,247,0.48)", fontSize: 9 },
  "& .MuiButton-root": {
    alignSelf: "flex-start",
    mt: 0.25,
    px: 1,
    py: 0.5,
    borderColor: "rgba(233,182,154,0.26)",
    borderRadius: "7px",
    backgroundColor: "rgba(233,182,154,0.09)",
    color: "#f0c4a8",
    fontSize: 9,
    "&:disabled": { cursor: "default", opacity: 0.5 },
  },
  "@media (max-width: 640px)": {
    width: 124,
    minWidth: 124,
    gap: 0.25,
    px: 1.125,
    py: 0.875,
    "& > span": { fontSize: 7 },
    "& > strong": { fontSize: 17 },
    "& > small": { display: "none" },
    "& .MuiButton-root": { mt: 0.125, px: 0.75, py: 0.375, fontSize: 8 },
  },
  "@media (max-width: 380px)": { width: 112, minWidth: 112 },
  "@media (max-width: 360px) and (orientation: portrait)": { width: 104, minWidth: 104 },
  "@media (max-width: 640px) and (orientation: landscape) and (max-height: 500px)": {
    gap: 0.125,
    px: 0.875,
    py: 0.5,
    "& > strong": { fontSize: 14 },
    "& .MuiButton-root": { px: 0.625, py: 0.25 },
  },
};
