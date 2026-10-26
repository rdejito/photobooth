/**
 * MUI styles for the shared ActionButton: the size/spacing base plus the
 * primary / secondary / quiet variant treatments.
 */
export const actionButtonBaseStyles = {
  minWidth: "fit-content",
  px: 2,
  py: 1.25,
  fontSize: "0.875rem",
  fontWeight: 500,
  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
  transition: "all 150ms ease",
};

export const actionButtonVariants = {
  primary: {
    variant: "contained",
    sx: {
      color: "common.white",
      backgroundColor: "primary.main",
      "&:hover": { backgroundColor: "primary.dark" },
    },
  },
  secondary: {
    variant: "outlined",
    sx: {
      color: "#fffaf7",
      borderColor: "rgba(255,255,255,0.18)",
      backgroundColor: "rgba(255,255,255,0.06)",
      "&:hover": {
        borderColor: "rgba(255,255,255,0.32)",
        backgroundColor: "rgba(255,255,255,0.12)",
      },
    },
  },
  quiet: {
    variant: "outlined",
    sx: {
      color: "#e5736b",
      borderColor: "rgba(229,115,107,0.45)",
      backgroundColor: "transparent",
      "&:hover": {
        borderColor: "rgba(229,115,107,0.75)",
        backgroundColor: "rgba(229,115,107,0.1)",
        color: "#f08a82",
      },
    },
  },
};
