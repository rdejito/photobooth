import Box from "@mui/material/Box";
import { cropGuideStyles } from "../../theme/styles/videoPreview.js";

/**
 * CropGuide — the framing guide drawn over one camera tile. The dashed frame
 * marks the region of this camera that survives the composition crop; the area
 * outside it is dimmed. Purely decorative, so it is hidden from assistive tech.
 *
 * @param {object} props
 * @param {{ x: number, y: number, width: number, height: number }|null} props.region
 *   Normalized (0..1) region of the camera frame to outline.
 * @param {string} [props.label] - Caption shown inside the guide.
 */
export default function CropGuide({ region, label = "Photo area" }) {
  if (!region) return null;

  return (
    <Box sx={cropGuideStyles.layer} aria-hidden="true">
      <Box
        sx={cropGuideStyles.frame}
        data-testid="camera-crop-guide"
        style={{
          left: `${region.x * 100}%`,
          top: `${region.y * 100}%`,
          width: `${region.width * 100}%`,
          height: `${region.height * 100}%`,
        }}
      >
        <Box component="span" sx={cropGuideStyles.caption}>
          {label}
        </Box>
      </Box>
    </Box>
  );
}
