import Box from "@mui/material/Box";
import ActionButton from "../atoms/ActionButton.jsx";
import CameraIcon from "../atoms/CameraIcon.jsx";
import {
  photoControlsActionsStyles,
  photoControlsPanelStyles,
} from "../../theme/styles/photoControls.js";

/**
 * PhotoControls — the booth's bottom action bar: camera toggle, take photo,
 * the saved-photos counter and the leave-booth button.
 *
 * The take button is the authority on readiness: guests see "Host takes
 * photo" (disabled) and a host with a not-yet-ready room sees a spinner-ish
 * "Getting cameras ready" state.
 *
 * @param {object} props
 * @param {boolean} props.isHost - Whether this device hosts the room.
 * @param {boolean} props.cameraEnabled - Whether this device's camera is on.
 * @param {() => void} props.toggleCamera - Flips the local camera.
 * @param {boolean} props.canCapture - True when every participant is ready.
 * @param {() => void} props.takePhoto - Starts the four-shot capture.
 * @param {() => void} props.leaveRoom - Leaves the booth session.
 * @param {number} props.galleryCount - Number of saved snapshots.
 * @param {() => void} props.toggleGallery - Opens/closes the snapshots dialog.
 */
export default function PhotoControls({
  isHost,
  cameraEnabled,
  toggleCamera,
  canCapture,
  takePhoto,
  leaveRoom,
  galleryCount,
  toggleGallery,
}) {
  return (
    <Box sx={photoControlsPanelStyles}>
      <Box sx={photoControlsActionsStyles}>
        <ActionButton
          onClick={toggleCamera}
          variant="secondary"
          ariaPressed={!cameraEnabled}
        >
          <CameraIcon className="capture-icon" />
          {cameraEnabled ? "Turn camera off" : "Turn camera on"}
        </ActionButton>
        <ActionButton
          onClick={takePhoto}
          disabled={!canCapture || !isHost}
          variant="primary"
        >
          <CameraIcon className="capture-icon" />
          {isHost ? (canCapture ? "Take photo" : "Getting cameras ready") : "Host takes photo"}
        </ActionButton>
        <ActionButton onClick={toggleGallery} variant="secondary">
          Photos {galleryCount > 0 ? `(${galleryCount})` : ""}
        </ActionButton>
        <ActionButton onClick={leaveRoom} variant="quiet">
          Leave booth
        </ActionButton>
      </Box>
    </Box>
  );
}