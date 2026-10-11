import Box from "@mui/material/Box";
import { countdownOverlayStyles } from "../../theme/styles/cameraStage.js";

/**
 * CountdownOverlay — the floating 3-2-1 bubble and "Shot n of 4" tag shown
 * while a capture is counting down. Announced to assistive tech via
 * `aria-live` on the wrapping box.
 *
 * @param {object} props
 * @param {number|string} props.countdown - Seconds remaining, or "📸" at flash.
 * @param {number} props.shotNumber - Current shot (1-based) within the burst.
 * @param {number} props.totalShots - Total shots in the burst.
 */
export default function CountdownOverlay({ countdown, shotNumber, totalShots }) {
  return (
    <Box sx={countdownOverlayStyles.wrap} aria-live="assertive">
      <Box component="div" sx={countdownOverlayStyles.countdown}>
        {countdown}
      </Box>
      {shotNumber > 0 && (
        <Box component="span" sx={countdownOverlayStyles.shotLabel}>
          Shot {shotNumber} of {totalShots}
        </Box>
      )}
    </Box>
  );
}