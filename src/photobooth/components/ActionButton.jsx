export default function ActionButton({
  children,
  onClick,
  disabled = false,
  variant = "primary",
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`room-action-button room-action-${variant}`}
    >
      {children}
    </button>
  );
}
