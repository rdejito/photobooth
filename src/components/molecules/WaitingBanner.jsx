import Box from "@mui/material/Box";
import CameraIcon from "../atoms/CameraIcon.jsx";
import { waitingBannerStyles } from "../../theme/styles/cameraStage.js";

/**
 * WaitingBanner — the bottom pill over the stage explaining that guests have
 * not all arrived yet. Purely presentational; visibility is the parent's job.
 *
 * @param {object} props
 * @param {string} props.message - The status line to show (or a default hint).
 */
export default function WaitingBanner({ message }) {
  return (
    <Box component="div" sx={waitingBannerStyles}>
      <Box component="span" sx={{ color: "#e9a77f" }}>
        <CameraIcon />
      </Box>
      <span>{message || "Share the photobooth code. Guests will appear here as they join."}</span>
    </Box>
  );
}