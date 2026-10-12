import { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import FlashOverlay from "./components/atoms/FlashOverlay.jsx";
import HomePage from "./pages/HomePage.jsx";
import BoothPage from "./pages/BoothPage.jsx";
import { usePhotoCapture } from "./hooks/usePhotoCapture.js";
import { usePhotoGallery } from "./hooks/usePhotoGallery.js";
import { usePeerRoom } from "./hooks/usePeerRoom.js";

/**
 * App — the app's root wiring.
 *
 * Owns the single room session (via usePeerRoom), the portrait gallery
 * (usePhotoGallery) and the capture state machine (usePhotoCapture), then
 * routes to the HomePage (join) or BoothPage (in-room) depending on the stage.
 * Callbacks are kept in a ref map so both directions of peer messaging land in
 * the same functions regardless of when connections arrive.
 */
export default function App() {
  const [roomInput, setRoomInput] = useState("");
  const [showGallery, setShowGallery] = useState(false);
  const participantVideosRef = useRef(new Map());
  const canvasRef = useRef(null);
  const photoCallbacksRef = useRef({});

  const room = usePeerRoom({
    onPhoto: (photo) => photoCallbacksRef.current.receivePhoto?.(photo),
    onCountdown: (value, meta) =>
      photoCallbacksRef.current.receiveCountdown?.(value, meta),
  });
  const { gallery, addPhoto, deletePhoto } = usePhotoGallery();

  // A photo can only be taken when the host's camera is on and every
  // participant has a ready stream.
  const canCapture =
    room.isHost &&
    room.cameraEnabled &&
    room.participants.length > 1 &&
    room.participants.every((participant) => participant.stream);

  const capture = usePhotoCapture({
    getVideoElements: () =>
      room.participants
        .map((participant) => ({
          video: participantVideosRef.current.get(participant.id),
          label: participant.label,
        }))
        .filter(
          ({ video }) =>
            video?.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0,
        ),
    canvasRef,
    addPhoto,
    setCallStatus: room.setCallStatus,
    expectedParticipantCount: room.participants.length,
    canCapture,
    broadcastPhoto: (photo) => photoCallbacksRef.current.broadcastPhoto?.(photo),
    broadcastCountdown: (value, meta) =>
      photoCallbacksRef.current.broadcastCountdown?.(value, meta),
  });
  photoCallbacksRef.current.receivePhoto = capture.receivePhoto;
  photoCallbacksRef.current.receiveCountdown = capture.receiveCountdown;
  photoCallbacksRef.current.broadcastPhoto = room.broadcastPhoto;
  photoCallbacksRef.current.broadcastCountdown = room.broadcastCountdown;

  const {
    stage,
    joinStatus,
    setJoinStatus,
    callStatus,
    connected,
    participants,
    isHost,
    cameraEnabled,
    roomCode,
    toggleCamera,
    createRoom,
    joinRoom,
    leaveRoom,
  } = room;

  const leaveCall = () => {
    capture.cancelCountdown();
    leaveRoom();
    capture.hidePreview();
  };

  // When a room attempt falls back to the join screen (a failed auto-rejoin,
  // a full room, or a pending camera permission prompt), surface the code the
  // hook is holding so the user can retry instead of staring at an empty
  // field. `roomInput` is omitted from the deps so a deliberate clear of the
  // field later is not undone.
  useEffect(() => {
    if (stage === "join" && roomCode && !roomInput) setRoomInput(roomCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, roomCode]);

  return (
    <Box
      component="main"
      sx={
        stage === "join"
          ? undefined
          : {
              position: "relative",
              width: "100%",
              height: "100vh",
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch",
              padding: "0 clamp(12px, 2vw, 28px) 10px",
              overflow: "hidden",
              color: "#fffaf7",
              background:
                "radial-gradient(ellipse at 80% 20%, rgba(102,57,77,0.24), transparent 38%), radial-gradient(ellipse at 12% 85%, rgba(95,67,116,0.16), transparent 36%), #171423",
              fontFamily: '"Avenir Next", Avenir, "Segoe UI", sans-serif',
              "@supports (height: 100dvh)": { height: "100dvh" },
              "@media (max-width: 640px)": {
                paddingRight: 12,
                paddingLeft: 12,
              },
              "@media (max-width: 380px)": {
                paddingRight: 8,
                paddingLeft: 8,
              },
            }
      }
    >
      {stage === "join" ? (
        <HomePage
          roomInput={roomInput}
          setRoomInput={setRoomInput}
          joinStatus={joinStatus}
          setJoinStatus={setJoinStatus}
          createRoom={() => createRoom(roomInput, setRoomInput)}
          joinRoom={() => joinRoom(roomInput)}
        />
      ) : (
        <BoothPage
          participants={participants}
          participantVideosRef={participantVideosRef}
          canvasRef={canvasRef}
          roomCode={roomCode}
          connected={connected}
          isHost={isHost}
          cameraEnabled={cameraEnabled}
          toggleCamera={toggleCamera}
          canCapture={canCapture}
          callStatus={callStatus}
          frame={capture.frame}
          setFrame={capture.setFrame}
          layout={capture.layout}
          setLayout={capture.setLayout}
          eventName={capture.eventName}
          setEventName={capture.setEventName}
          countdown={capture.countdown}
          shotNumber={capture.shotNumber}
          totalShots={capture.totalShots}
          showPreview={capture.showPreview}
          canCustomizePreview={capture.canCustomizePreview}
          photoPending={capture.photoPending}
          photoDataUrl={capture.photoDataUrl}
          takePhoto={capture.takePhoto}
          savePhoto={capture.savePhoto}
          leaveRoom={leaveCall}
          hidePreview={capture.hidePreview}
          gallery={gallery}
          showGallery={showGallery}
          setShowGallery={setShowGallery}
          deletePhoto={deletePhoto}
        />
      )}
      <FlashOverlay visible={capture.showFlash} />
    </Box>
  );
}