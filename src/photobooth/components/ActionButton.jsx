import { Button } from "flowbite-react";

const variantClasses = {
  primary: "bg-primary-700 text-white hover:bg-primary-800 focus:ring-primary-300",
  secondary: "bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 focus:ring-primary-200",
  quiet: "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-200",
};

export default function ActionButton({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  ariaPressed,
}) {
  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={ariaPressed}
      className={`${variantClasses[variant] ?? variantClasses.primary} min-w-fit px-4 py-2.5 text-sm font-medium shadow-sm transition-all`}
    >
      {children}
    </Button>
  );
}
