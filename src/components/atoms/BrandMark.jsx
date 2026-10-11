import Box from "@mui/material/Box";
import CameraIcon from "./CameraIcon.jsx";

/**
 * BrandMark — the "Little Moments" lockup (camera glyph + wordmark).
 *
 * Shared by the home navigation and the booth header so the brand always looks
 * identical. Callers supply the wrapper/mark styles, which lets each screen
 * keep its own spacing and type while the mark itself stays one component.
 *
 * @param {object} props
 * @param {"div"|"a"} [props.as="div"] - Root element (use "a" with `href`).
 * @param {string} [props.href] - Link target when `as` is "a".
 * @param {string} [props.ariaLabel] - Accessible name for the lockup.
 * @param {object} props.wrapperSx - MUI styles for the outer lockup row.
 * @param {object} props.markSx - MUI styles for the camera-mark badge.
 */
export default function BrandMark({
  as = "div",
  href,
  ariaLabel,
  wrapperSx,
  markSx,
}) {
  return (
    <Box component={as} href={href} aria-label={ariaLabel} sx={wrapperSx}>
      <Box component="span" sx={markSx}>
        <CameraIcon />
      </Box>
      <Box component="span" sx={{ font: "inherit", color: "inherit" }}>
        Little Moments
      </Box>
    </Box>
  );
}