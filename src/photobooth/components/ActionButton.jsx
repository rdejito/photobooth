export default function ActionButton({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  ariaPressed,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={ariaPressed}
      className={`room-action-button room-action-${variant}`}
    >
      {children}
    </button>
  );
}
