import Box from "@mui/material/Box";
import { photoAreaGuideStyles } from "../../theme/styles/photoAreaGuide.js";

/**
 * PhotoAreaGuide — the dashed frame drawn inside one camera tile to confirm the
 * area that survives into the final photo.
 *
 * The tile is already cropped to exactly that area, so this is a reassurance
 * marker rather than a second crop: it dims nothing, never intercepts pointer
 * events, and is hidden from assistive tech.
 *
 * @param {object} props
 * @param {string} [props.label] - Caption shown inside the frame.
 */
export default function PhotoAreaGuide({ label = "Photo area" }) {
  return (
    <Box sx={photoAreaGuideStyles.layer} aria-hidden="true">
      <Box sx={photoAreaGuideStyles.frame} data-testid="camera-photo-area-guide">
        <Box component="span" sx={photoAreaGuideStyles.caption}>
          {label}
        </Box>
      </Box>
    </Box>
  );
}
