import Box from "@mui/material/Box";

/**
 * StatusDot — a small coloured indicator dot.
 *
 * Used for the navigation "live" light, the booth connection pill, the camera
 * stage label and each video tile's label. Callers set the colour and, when
 * wanted, a soft glow of the same hue.
 *
 * @param {object} props
 * @param {number} [props.size=7] - Diameter in pixels.
 * @param {string} props.color - Fill colour.
 * @param {string} [props.glowColor] - Glow colour; omit for no shadow.
 * @param {string} [props.className] - Extra class (e.g. for parent selectors).
 * @param {object} [props.sx] - Extra MUI styles.
 */
export default function StatusDot({ size = 7, color, glowColor, className, sx }) {
  return (
    <Box
      component="span"
      className={className}
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: "50%",
        backgroundColor: color,
        boxShadow: glowColor ? `0 0 10px ${glowColor}` : "none",
        ...sx,
      }}
    />
  );
}
