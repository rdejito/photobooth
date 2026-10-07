import { useEffect, useRef, useState } from "react";
import { PeerRoomSession } from "../PeerRoomSession.js";

const getCameraPermissionMessage = (error) => {
  if (!error) return "We couldn’t access your camera or microphone. Please allow camera access in your browser and try again.";

  switch (error.name) {
    case "NotAllowedError":
      return "Camera access was blocked. Please allow the camera and microphone in your browser, then try again.";
    case "NotFoundError":
      return "No camera or microphone was detected. Connect a device or check your browser settings, then try again.";
    case "NotReadableError":
      return "Your camera is already in use by another app. Close it and try again.";
    case "OverconstrainedError":
      return "Your device does not support the required camera settings. Try a different device or browser.";
    default:
      return "We couldn’t access your camera or microphone. Please make sure you’re on a secure connection and your browser has permission to use your camera.";
  }
};

export function usePeerRoom({ onPhoto, onCountdown }) {
  const [stage, setStage] = useState("join");
  const [joinStatus, setJoinStatus] = useState(
    "Share a room code or create a new photobooth.",
  );
  const [callStatus, setCallStatus] = useState("");
  const [participants, setParticipants] = useState([]);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const sessionRef = useRef(null);

  const startSession = async (role, room) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      const session = new PeerRoomSession({
        stream,
        onParticipants: setParticipants,
        onStatus: setCallStatus,
        onPhoto,
        onCountdown,
        onRoomFull: () => {
          onCountdown(null);
          sessionRef.current?.destroy();
          sessionRef.current = null;
          setStage("join");
          setParticipants([]);
          setJoinStatus("This room is full. The limit is four participants.");
        },
        onRoomClosed: () => {
          onCountdown(null);
          sessionRef.current?.destroy();
          sessionRef.current = null;
          setStage("join");
          setParticipants([]);
          setJoinStatus("The room creator ended the photobooth.");
        },
        onConnectionFailed: (message) => {
          if (sessionRef.current !== session) return;
          sessionRef.current = null;
          session.destroy();
          onCountdown(null);
          setParticipants([]);
          setCameraEnabled(true);
          setStage("join");
          setJoinStatus(message);
        },
      });
      sessionRef.current = session;
      setCameraEnabled(true);
      setStage("call");
      if (role === "host") session.startHost(room);
      else session.join(room);
    } catch (error) {
      console.error(`Could not ${role === "host" ? "create" : "join"} room:`, error);
      setJoinStatus(getCameraPermissionMessage(error));
    }
  };

  const createRoom = (roomInput, setRoomInput) => {
    const room = (roomInput || Math.random().toString(36).slice(2, 7)).toUpperCase();
    setRoomInput(room);
    setCallStatus(`Opening photobooth "${room}"...`);
    startSession("host", room);
  };

  const joinRoom = (roomInput) => {
    const room = (roomInput || "").toUpperCase().trim();
    if (!room) {
      setJoinStatus("Enter a room code first.");
      return;
    }
    setCallStatus(`Joining photobooth "${room}"...`);
    startSession("guest", room);
  };

  const leaveRoom = () => {
    sessionRef.current?.destroy();
    sessionRef.current = null;
    setParticipants([]);
    setCameraEnabled(true);
    setStage("join");
  };

  const toggleCamera = () => {
    const tracks = sessionRef.current?.stream.getVideoTracks() ?? [];
    if (tracks.length === 0) {
      setCallStatus("No camera track is available.");
      return;
    }

    const nextEnabled = !cameraEnabled;
    tracks.forEach((track) => {
      track.enabled = nextEnabled;
    });
    sessionRef.current?.setCameraEnabled(nextEnabled);
    setCameraEnabled(nextEnabled);
  };

  useEffect(
    () => () => {
      sessionRef.current?.destroy();
      sessionRef.current = null;
    },
    [],
  );

  return {
    stage,
    setStage,
    joinStatus,
    setJoinStatus,
    callStatus,
    setCallStatus,
    participants,
    cameraEnabled,
    toggleCamera,
    isHost: Boolean(sessionRef.current?.isHost),
    connected: participants.some((participant) => !participant.local && participant.stream),
    broadcastPhoto: (photo) => sessionRef.current?.broadcastPhoto(photo),
    broadcastCountdown: (value) => sessionRef.current?.broadcastCountdown(value),
    createRoom,
    joinRoom,
    leaveRoom,
  };
}
