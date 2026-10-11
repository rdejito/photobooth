/**
 * MUI styles for the join/create room card (JoinRoomPanel). This is the one
 * light-surface component: a paper card with a rose accent, distinct from the
 * dark booth surfaces.
 */
export const joinPanelStyles = {
  width: "100%",
  maxWidth: 448,
  p: 3,
  border: "1px solid #ffe4e6",
  borderRadius: 3,
  backgroundColor: "rgba(255, 255, 255, 0.9)",
  boxShadow: "0 24px 80px rgba(76, 29, 149, 0.12)",
  backdropFilter: "blur(8px)",
};

export const joinBadgeStyles = {
  display: "inline-flex",
  width: 28,
  height: 28,
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  borderRadius: "50%",
  color: "#e11d48",
  backgroundColor: "#ffe4e6",
  "& svg": { width: 16, height: 16 },
};

export const joinEyebrowStyles = {
  color: "#f43f5e",
  fontSize: "0.625rem",
  fontWeight: 600,
  letterSpacing: "0.28em",
  textTransform: "uppercase",
};

export const joinTitleStyles = {
  mb: 1,
  fontWeight: 700,
  letterSpacing: "-0.025em",
  color: "#0f172a",
};

export const joinIntroStyles = { mb: 3, color: "#475569", fontSize: "0.875rem" };

export const joinLabelStyles = {
  display: "block",
  mb: 1,
  color: "#475569",
  fontSize: "0.75rem",
  fontWeight: 600,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
};

export const joinFieldStyles = {
  "& .MuiOutlinedInput-root": {
    minHeight: 52,
    borderRadius: 1,
    backgroundColor: "#ffffff",
    "& fieldset": { borderColor: "#fecdd3" },
    "&:hover fieldset": { borderColor: "#fda4af" },
    "&.Mui-focused fieldset": { borderColor: "primary.main" },
  },
  "& input": {
    color: "#0f172a",
    fontSize: "1rem",
    "&::placeholder": { color: "#94a3b8", opacity: 1 },
  },
};

export const joinHelpStyles = { color: "#64748b", fontSize: "0.875rem" };

export const joinActionsGridStyles = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: 1.5,
  "@media (min-width: 640px)": { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" },
};

export const joinCreateButtonStyles = {
  minHeight: 48,
  color: "#ffffff",
  backgroundColor: "primary.dark",
  "&:hover": { backgroundColor: "#9d174d" },
};

export const joinSubmitButtonStyles = {
  minHeight: 48,
  borderColor: "#e2e8f0",
  color: "#1e293b",
  backgroundColor: "#ffffff",
  "&:hover": { borderColor: "#cbd5e1", backgroundColor: "#f8fafc" },
};

export const joinStatusStyles = {
  mt: 2,
  minHeight: 24,
  borderRadius: 1,
  px: 1.5,
  py: 1,
  color: "#be123c",
  backgroundColor: "#fff1f2",
  fontSize: "0.875rem",
};
