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
      color: "text.primary",
      borderColor: "#e5e7eb",
      backgroundColor: "#ffffff",
      "&:hover": { borderColor: "#d1d5db", backgroundColor: "#f9fafb" },
    },
  },
  quiet: {
    variant: "text",
    sx: { color: "#374151", "&:hover": { backgroundColor: "#f3f4f6" } },
  },
};
