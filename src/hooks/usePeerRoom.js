import { useEffect, useRef, useState } from "react";
import { PeerRoomSession } from "../services/PeerRoomSession.js";
import {
  clearRejoinSession,
  createDeviceId,
  normalizeRoomCode,
  readRejoinSession,
  saveRejoinSession,
} from "../lib/rejoin.js";

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
  const [roomCode, setRoomCode] = useState("");
  const sessionRef = useRef(null);
  const pendingRef = useRef(false);
  const requestIdRef = useRef(0);
  const unmountedRef = useRef(false);

  const startSession = async (role, room, deviceId = null, rejoinToken = null) => {
    const requestId = ++requestIdRef.current;
    pendingRef.current = true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      if (unmountedRef.current || requestId !== requestIdRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      if (sessionRef.current) {
        sessionRef.current.destroy();
        sessionRef.current = null;
      }
      const session = new PeerRoomSession({
        stream,
        deviceId,
        rejoinToken,
        onRejoinToken: (token) => {
          if (role === "guest") saveRejoinSession(room, deviceId, token);
        },
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
          clearRejoinSession();
          setRoomCode("");
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
          clearRejoinSession();
          setRoomCode("");
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
    } finally {
      pendingRef.current = false;
    }
  };

  const createRoom = (roomInput, setRoomInput) => {
    const room = normalizeRoomCode(roomInput || Math.random().toString(36).slice(2, 7));
    setRoomInput(room);
    setRoomCode(room);
    setCallStatus(`Opening photobooth "${room}"...`);
    startSession("host", room);
  };

  const joinRoom = (roomInput, { rejoin = false } = {}) => {
    const room = normalizeRoomCode(roomInput || "");
    if (!room) {
      setJoinStatus("Enter a room code first.");
      return;
    }
    // Remember the room and this device's rejoin id so a refresh or accidental
    // close can drop the guest back into the same booth. A token is scoped to
    // its room: joining a different room must not present (or keep) the old one.
    const saved = readRejoinSession();
    const deviceId = saved?.deviceId || createDeviceId();
    const rejoinToken = saved?.room === room ? saved.rejoinToken : null;
    saveRejoinSession(room, deviceId, rejoinToken);
    setRoomCode(room);
    setCallStatus(
      rejoin
        ? `Reconnecting to photobooth "${room}"...`
        : `Joining photobooth "${room}"...`,
    );
    startSession("guest", room, deviceId, rejoinToken);
  };

  const leaveRoom = () => {
    requestIdRef.current += 1;
    clearRejoinSession();
    setRoomCode("");
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

  // Restore the last room on load so a refresh or accidental tab close returns
  // the guest to the same booth without re-typing the code. Room codes left by
  // an explicit leave or a closed room are already cleared, so only a genuine
  // disconnect reaches here.
  useEffect(() => {
    const saved = readRejoinSession();
    if (!saved?.room) return;
    setJoinStatus("Reconnecting to your booth…");
    joinRoom(saved.room, { rejoin: true });
    // Run once on mount; joinRoom only reads refs and stable state setters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Release the camera and signal departure both when the component unmounts
  // and when the browser unloads the page (tab close, reload, navigation).
  // `pagehide` is skipped when the page is entering the back/forward cache,
  // since such a page can resume with its session intact. The unload teardown
  // also stops the local tracks so the camera light goes out immediately.
  useEffect(() => {
    unmountedRef.current = false;
    const teardown = (options) => {
      requestIdRef.current += 1;
      sessionRef.current?.destroy(options);
      sessionRef.current = null;
    };
    const handlePageHide = (event) => {
      if (event.persisted) return;
      teardown({ unload: true });
    };
    window.addEventListener("pagehide", handlePageHide);
    return () => {
      unmountedRef.current = true;
      window.removeEventListener("pagehide", handlePageHide);
      teardown();
    };
  }, []);

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
    roomCode,
    isHost: Boolean(sessionRef.current?.isHost),
    // A peer in its disconnect grace window is still part of the room, so it
    // keeps the session "connected" instead of flashing the waiting banner for
    // a brief blip. Peers that are still connecting (no stream, not yet
    // disconnected) continue not to count, as before. Capture readiness stays
    // strict in App (it needs every participant's live stream).
    connected: participants.some(
      (participant) =>
        !participant.local && (participant.stream || participant.connected === false),
    ),
    broadcastPhoto: (photo) => sessionRef.current?.broadcastPhoto(photo),
    broadcastCountdown: (value, meta) =>
      sessionRef.current?.broadcastCountdown(value, meta),
    createRoom,
    joinRoom,
    leaveRoom,
  };
}
