import Button from "@mui/material/Button";
import { actionButtonBaseStyles, actionButtonVariants } from "../../theme/styles/actionButton.js";

/**
 * ActionButton — the shared button primitive used across the booth.
 *
 * Small, self-contained atom: picks a variant's MUI props and merges the common
 * sizing/spacing base with the variant's colour treatment.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Button label/content.
 * @param {() => void} [props.onClick] - Click handler.
 * @param {boolean} [props.disabled=false] - Disables the button.
 * @param {"primary"|"secondary"|"quiet"} [props.variant="primary"] - Visual style.
 * @param {boolean} [props.ariaPressed] - Toggle state for `aria-pressed`.
 */
export default function ActionButton({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  ariaPressed,
}) {
  const styles = actionButtonVariants[variant] ?? actionButtonVariants.primary;

  return (
    <Button
      type="button"
      variant={styles.variant}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={ariaPressed}
      sx={{ ...actionButtonBaseStyles, ...styles.sx }}
    >
      {children}
    </Button>
  );
}
