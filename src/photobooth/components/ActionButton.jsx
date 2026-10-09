import Button from "@mui/material/Button";

const variantStyles = {
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
    sx: {
      color: "#374151",
      "&:hover": { backgroundColor: "#f3f4f6" },
    },
  },
};

export default function ActionButton({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  ariaPressed,
}) {
  const styles = variantStyles[variant] ?? variantStyles.primary;

  return (
    <Button
      type="button"
      variant={styles.variant}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={ariaPressed}
      sx={{
        minWidth: "fit-content",
        px: 2,
        py: 1.25,
        fontSize: "0.875rem",
        fontWeight: 500,
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
        transition: "all 150ms ease",
        ...styles.sx,
      }}
    >
      {children}
    </Button>
  );
}
