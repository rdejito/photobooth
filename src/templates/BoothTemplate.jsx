import { useState } from "react";
import Box from "@mui/material/Box";
import BoothHeader from "../components/organisms/BoothHeader.jsx";
import BoothIntro from "../components/organisms/BoothIntro.jsx";
import CameraStage from "../components/organisms/CameraStage.jsx";
import PhotoControls from "../components/organisms/PhotoControls.jsx";
import PhotoCustomizePanel from "../components/organisms/PhotoCustomizePanel.jsx";
import PhotoPreview from "../components/organisms/PhotoPreview.jsx";
import GalleryDialog from "../components/molecules/GalleryDialog.jsx";
import { downloadDataUrl, littleMomentsFilename } from "../lib/download.js";
import {
  boothShellStyles,
  boothWorkspaceStyles,
} from "../theme/styles/boothTemplate.js";

/**
 * BoothTemplate — the complete in-room screen layout: header, intro band,
 * camera stage, control bar, host customization, the photo preview and the
 * snapshots dialog. This is the largest composition in the app; every section
 * is an organism/molecule so each part stays under the line budget and is
 * individually reusable.
 *
 * All room/capture state flows in from the page via props — the template owns
 * only the ephemeral copy-code status and the download naming.
 *
 * @param {object} props - The full booth prop set from App (participants,
 *   capture state, gallery state, room callbacks).
 */
export default function BoothTemplate({
  participants,
  participantVideosRef,
  canvasRef,
  roomCode,
  connected,
  isHost,
  cameraEnabled,
  toggleCamera,
  canCapture,
  callStatus,
  frame,
  setFrame,
  layout,
  setLayout,
  eventName,
  setEventName,
  countdown,
  shotNumber,
  totalShots,
  showPreview,
  canCustomizePreview,
  photoPending,
  photoDataUrl,
  takePhoto,
  savePhoto,
  leaveRoom,
  hidePreview,
  gallery,
  showGallery,
  setShowGallery,
  deletePhoto,
}) {
  const [copyStatus, setCopyStatus] = useState("");

  // Clipboard copy needs a status line on success or failure.
  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopyStatus("Copied");
    } catch {
      setCopyStatus("Copy failed — select the code and copy it manually.");
    }
  };

  // Gallery downloads use the app-wide naming so files never collide.
  const downloadPhoto = (photo) => {
    downloadDataUrl(photo.dataUrl, littleMomentsFilename(photo.id));
  };

  return (
    <Box component="section" className="room-shell" sx={boothShellStyles}>
      <BoothHeader connected={connected} participantCount={participants.length} />
      <BoothIntro
        connected={connected}
        roomCode={roomCode}
        copyStatus={copyStatus}
        onCopy={copyRoomCode}
      />
      <Box sx={boothWorkspaceStyles}>
        <CameraStage
          participants={participants}
          participantVideosRef={participantVideosRef}
          connected={connected}
          callStatus={callStatus}
          countdown={countdown}
          shotNumber={shotNumber}
          totalShots={totalShots}
          layout={layout}
        />
        <PhotoControls
          isHost={isHost}
          cameraEnabled={cameraEnabled}
          toggleCamera={toggleCamera}
          canCapture={canCapture}
          takePhoto={takePhoto}
          leaveRoom={leaveRoom}
          galleryCount={gallery.length}
          toggleGallery={() => setShowGallery((visible) => !visible)}
        />
        {canCustomizePreview && !showPreview && (
          <PhotoCustomizePanel
            frame={frame}
            setFrame={setFrame}
            layout={layout}
            setLayout={setLayout}
          />
        )}
      </Box>
      <PhotoPreview
        canvasRef={canvasRef}
        imageData={photoDataUrl}
        visible={showPreview}
        canCustomize={canCustomizePreview}
        photoPending={photoPending}
        frame={frame}
        setFrame={setFrame}
        layout={layout}
        setLayout={setLayout}
        eventName={eventName}
        setEventName={setEventName}
        savePhoto={savePhoto}
        hidePreview={hidePreview}
      />
      <GalleryDialog
        open={showGallery}
        onClose={() => setShowGallery(false)}
        gallery={gallery}
        deletePhoto={deletePhoto}
        downloadPhoto={downloadPhoto}
      />
    </Box>
  );
}