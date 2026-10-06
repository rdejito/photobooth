import ActionButton from "./ActionButton.jsx";
import CameraIcon from "./CameraIcon.jsx";
import FramePicker from "./FramePicker.jsx";

export default function PhotoControls({
  frame,
  setFrame,
  isHost,
  canCapture,
  takePhoto,
  leaveRoom,
  galleryCount,
  toggleGallery,
}) {
  return (
    <div className="room-controls-panel">
      <FramePicker frame={frame} setFrame={setFrame} />
      <div className="room-actions-bar">
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
      </div>
    </div>
  );
}
