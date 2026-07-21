import { useState, useRef, useEffect } from "react";
import Peer from "peerjs";

const FRAMES = [
  { key: "classic", label: "💗 Classic" },
  { key: "arcade", label: "🕹️ Arcade" },
  { key: "polaroid", label: "📷 Polaroid" },
  { key: "film", label: "🎞️ Film Strip" },
  { key: "none", label: "⬜ None" },
];

function drawMirroredVideo(ctx, video, x, y, w, h) {
  ctx.save();
  ctx.translate(x + w, y);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0, w, h);
  ctx.restore();
}

function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Turns a human-friendly room code into a valid, fairly-unique PeerJS id
function roomToPeerId(room) {
  return "photobooth-" + room.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

export default function LivePhotobooth() {
  const [stage, setStage] = useState("join"); // join | call
  const [roomInput, setRoomInput] = useState("");
  const [joinStatus, setJoinStatus] = useState("Share the same code with the other person.");
  const [callStatus, setCallStatus] = useState("");
  const [connected, setConnected] = useState(false);
  const [frame, setFrame] = useState("classic");
  const [countdown, setCountdown] = useState(null);
  const [showFlash, setShowFlash] = useState(false);
  const [showStrip, setShowStrip] = useState(false);
  const [gallery, setGallery] = useState(() => {
    try {
      const saved = localStorage.getItem("photobooth-gallery");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showGallery, setShowGallery] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const canvasRef = useRef(null);

  const peerRef = useRef(null);
  const callRef = useRef(null);
  const localStreamRef = useRef(null);

  const getMedia = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStreamRef.current = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    return stream;
  };

  const wireUpCall = (call) => {
    callRef.current = call;
    call.on("stream", (remoteStream) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
      setConnected(true);
      setCallStatus("Connected! Say cheese 🧀");
    });
    call.on("close", () => {
      setConnected(false);
      setCallStatus("The other person left the call.");
    });
    call.on("error", (err) => {
      setCallStatus("Call error: " + err.message);
    });
  };

  // Creator: registers under the room's peer id and waits for an incoming call
  const createRoom = async () => {
    const room = (roomInput || Math.random().toString(36).slice(2, 7)).toUpperCase();
    setRoomInput(room);
    const peerId = roomToPeerId(room);

    setStage("call");
    setCallStatus(`Room "${room}" created. Waiting for the other person to join...`);
    const stream = await getMedia();

    const peer = new Peer(peerId);
    peerRef.current = peer;

    peer.on("open", () => {
      setCallStatus(`Room "${room}" created. Waiting for the other person to join...`);
    });

    peer.on("call", (incomingCall) => {
      incomingCall.answer(stream);
      wireUpCall(incomingCall);
    });

    peer.on("error", (err) => {
      if (err.type === "unavailable-id") {
        setCallStatus('That room code is already in use right now — try a different one.');
      } else {
        setCallStatus("Connection error: " + err.type);
      }
    });
  };

  // Joiner: connects to the creator's peer id directly
  const joinRoom = async () => {
    const room = (roomInput || "").toUpperCase().trim();
    if (!room) {
      setJoinStatus("Enter a room code first.");
      return;
    }
    const targetPeerId = roomToPeerId(room);

    setStage("call");
    setCallStatus("Connecting...");
    const stream = await getMedia();

    const peer = new Peer();
    peerRef.current = peer;

    peer.on("open", () => {
      const call = peer.call(targetPeerId, stream);
      if (!call) {
        setCallStatus("Could not reach that room. Double check the code.");
        return;
      }
      wireUpCall(call);
    });

    peer.on("error", (err) => {
      setCallStatus("Connection error: " + err.type + " — check the room code and try again.");
    });
  };

  const leaveRoom = () => {
    if (callRef.current) callRef.current.close();
    if (peerRef.current) peerRef.current.destroy();
    if (localStreamRef.current) localStreamRef.current.getTracks().forEach((t) => t.stop());
    setConnected(false);
    setShowStrip(false);
    setStage("join");
  };

  useEffect(() => {
    return () => {
      if (callRef.current) callRef.current.close();
      if (peerRef.current) peerRef.current.destroy();
      if (localStreamRef.current) localStreamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("photobooth-gallery", JSON.stringify(gallery));
    } catch (e) {
      // localStorage might be full if there are many high-res photos saved
      console.warn("Could not save gallery to localStorage:", e);
    }
  }, [gallery]);

  const flashScreen = () => {
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 400);
  };

  const runCountdown = (cb) => {
    let n = 3;
    setCountdown(n);
    const t = setInterval(() => {
      n -= 1;
      if (n === 0) {
        setCountdown("📸");
      } else if (n < 0) {
        clearInterval(t);
        setCountdown(null);
        cb();
      } else {
        setCountdown(n);
      }
    }, 700);
  };

  const takePhoto = () => {
    runCountdown(() => {
      flashScreen();
      const localV = localVideoRef.current;
      const remoteV = remoteVideoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const w = 640, h = 480;

      if (frame === "classic") {
        const pad = 16, headerH = 60;
        canvas.width = w * 2 + pad * 3;
        canvas.height = h + pad * 2 + headerH;
        ctx.fillStyle = "#fff8e7";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawMirroredVideo(ctx, localV, pad, pad + headerH, w, h);
        drawMirroredVideo(ctx, remoteV, pad * 2 + w, pad + headerH, w, h);
        ctx.strokeStyle = "#ff2d75";
        ctx.lineWidth = 4;
        ctx.strokeRect(pad, pad + headerH, w, h);
        ctx.strokeRect(pad * 2 + w, pad + headerH, w, h);
        ctx.fillStyle = "#ff2d75";
        ctx.font = "bold 28px Courier New";
        ctx.textAlign = "center";
        ctx.fillText("📸 LIVE PHOTOBOOTH — " + new Date().toLocaleDateString(), canvas.width / 2, 38);
      } else if (frame === "arcade") {
        const pad = 14, headerH = 54, footerH = 30;
        canvas.width = w * 2 + pad * 3;
        canvas.height = h + pad * 2 + headerH + footerH;
        ctx.fillStyle = "#0b0033";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "#00ffe1";
        ctx.lineWidth = 6;
        ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);
        ctx.strokeStyle = "#ff2d75";
        ctx.lineWidth = 2;
        ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
        drawMirroredVideo(ctx, localV, pad, pad + headerH, w, h);
        drawMirroredVideo(ctx, remoteV, pad * 2 + w, pad + headerH, w, h);
        ctx.strokeStyle = "#ffcc00";
        ctx.lineWidth = 4;
        ctx.strokeRect(pad, pad + headerH, w, h);
        ctx.strokeRect(pad * 2 + w, pad + headerH, w, h);
        ctx.fillStyle = "#00ffe1";
        ctx.font = "bold 26px Courier New";
        ctx.textAlign = "center";
        ctx.shadowColor = "#00ffe1";
        ctx.shadowBlur = 10;
        ctx.fillText("▓▓ PLAYER 1  +  PLAYER 2 ▓▓", canvas.width / 2, 36);
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#ff2d75";
        ctx.font = "16px Courier New";
        ctx.fillText("INSERT COIN TO CONTINUE — " + new Date().toLocaleDateString(), canvas.width / 2, canvas.height - 12);
      } else if (frame === "polaroid") {
        const cardPad = 22, gap = 24, bottomPad = 70;
        const cardW = w * 0.7, cardH = h * 0.7;
        canvas.width = cardW * 2 + cardPad * 2 + gap;
        canvas.height = cardH + bottomPad + cardPad * 2;
        ctx.fillStyle = "#d8cfc3";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const polaroidCard = (video, x, y, label) => {
          ctx.save();
          ctx.shadowColor = "rgba(0,0,0,0.4)";
          ctx.shadowBlur = 12;
          ctx.shadowOffsetY = 6;
          ctx.fillStyle = "#fffdf8";
          ctx.fillRect(x, y, cardW, cardH + bottomPad);
          ctx.restore();
          drawMirroredVideo(ctx, video, x + 10, y + 10, cardW - 20, cardH - 20);
          ctx.fillStyle = "#333";
          ctx.font = "italic 18px Courier New";
          ctx.textAlign = "center";
          ctx.fillText(label, x + cardW / 2, y + cardH + 40);
        };
        polaroidCard(localV, cardPad, cardPad, "you 💕");
        polaroidCard(remoteV, cardPad * 2 + cardW + gap - cardPad, cardPad, "them 💕");
      } else if (frame === "film") {
        const holeR = 10, holeGap = 34, sideStripW = 44, pad = 10;
        canvas.width = w * 2 + pad * 3 + sideStripW * 2;
        canvas.height = h + pad * 2;
        ctx.fillStyle = "#111";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const sprocketStrip = (x) => {
          ctx.fillStyle = "#111";
          ctx.fillRect(x, 0, sideStripW, canvas.height);
          ctx.fillStyle = "#f5f0e6";
          for (let y = holeGap / 2; y < canvas.height; y += holeGap) {
            roundRectPath(ctx, x + sideStripW / 2 - holeR, y - holeR, holeR * 2, holeR * 2, 3);
            ctx.fill();
          }
        };
        sprocketStrip(0);
        sprocketStrip(canvas.width - sideStripW);

        drawMirroredVideo(ctx, localV, sideStripW + pad, pad, w, h);
        drawMirroredVideo(ctx, remoteV, sideStripW + pad * 2 + w, pad, w, h);
        ctx.fillStyle = "rgba(255,180,90,0.08)";
        ctx.fillRect(sideStripW, 0, canvas.width - sideStripW * 2, canvas.height);
        ctx.strokeStyle = "#f5f0e6";
        ctx.lineWidth = 3;
        ctx.strokeRect(sideStripW + pad, pad, w, h);
        ctx.strokeRect(sideStripW + pad * 2 + w, pad, w, h);
      } else {
        canvas.width = w * 2 + 8;
        canvas.height = h;
        drawMirroredVideo(ctx, localV, 0, 0, w, h);
        drawMirroredVideo(ctx, remoteV, w + 8, 0, w, h);
      }

      const dataUrl = canvas.toDataURL("image/png");
      const entry = {
        id: Date.now(),
        dataUrl,
        frame,
        takenAt: new Date().toLocaleString(),
      };
      setGallery((prev) => [entry, ...prev]);

      setShowStrip(true);
    });
  };

  const downloadPhoto = (dataUrl, id) => {
    const a = document.createElement("a");
    a.download = "live-photobooth-" + (id || Date.now()) + ".png";
    a.href = dataUrl || canvasRef.current.toDataURL("image/png");
    a.click();
  };

  const deletePhoto = (id) => {
    setGallery((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily: "'Courier New', monospace",
        background: "linear-gradient(135deg, #2b1055, #7597de)",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "24px 16px 60px",
      }}
    >
      <h1
        style={{
          margin: "8px 0 2px",
          letterSpacing: 2,
          textShadow: "3px 3px 0 #ff2d75",
          fontSize: 28,
        }}
      >
        📸 LIVE PHOTOBOOTH
      </h1>
      <div style={{ opacity: 0.8, marginBottom: 20, fontSize: 13 }}>
        connect from two different places, snap a photo together
      </div>

      {stage === "join" && (
        <div
          style={{
            background: "rgba(0,0,0,0.35)",
            border: "2px solid #ff2d75",
            borderRadius: 14,
            padding: "18px 20px",
            maxWidth: 420,
            width: "100%",
            textAlign: "center",
            marginBottom: 20,
          }}
        >
          <div style={{ marginBottom: 10 }}>Room Code</div>
          <input
            value={roomInput}
            onChange={(e) => setRoomInput(e.target.value)}
            placeholder="e.g. GEMS22"
            maxLength={10}
            style={{
              fontFamily: "inherit",
              padding: "10px 12px",
              borderRadius: 8,
              border: "none",
              fontSize: 15,
              width: "65%",
              textAlign: "center",
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          />
          <div style={{ marginTop: 14 }}>
            <ActionButton onClick={createRoom}>Create Room</ActionButton>
            <ActionButton onClick={joinRoom}>Join Room</ActionButton>
          </div>
          <div style={{ fontSize: 13, marginTop: 10, minHeight: 18, opacity: 0.9 }}>{joinStatus}</div>
        </div>
      )}

      {stage === "call" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              justifyContent: "center",
              background: "#111",
              padding: 12,
              borderRadius: 16,
              border: "3px solid #ffcc00",
            }}
          >
            <div style={{ position: "relative" }}>
              <video ref={localVideoRef} autoPlay playsInline muted style={videoStyle} />
              <div style={tagStyle}>You</div>
            </div>
            <div style={{ position: "relative" }}>
              <video ref={remoteVideoRef} autoPlay playsInline style={videoStyle} />
              <div style={tagStyle}>Them</div>
            </div>
          </div>

          {countdown !== null && (
            <div
              style={{
                fontSize: 80,
                fontWeight: "bold",
                color: "#ffcc00",
                textShadow: "4px 4px 0 #ff2d75",
              }}
            >
              {countdown}
            </div>
          )}

          <div
            style={{
              marginTop: 14,
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: 13, opacity: 0.8, marginRight: 4 }}>Frame:</span>
            {FRAMES.map((f) => (
              <button
                key={f.key}
                onClick={() => setFrame(f.key)}
                style={{
                  fontFamily: "inherit",
                  border: frame === f.key ? "2px solid #fff" : "2px solid transparent",
                  background: frame === f.key ? "#ffcc00" : "rgba(255,255,255,0.15)",
                  color: frame === f.key ? "#2b1055" : "#fff",
                  fontSize: 12,
                  padding: "7px 12px",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            <ActionButton onClick={takePhoto} disabled={!connected}>
              {connected ? "📸 Take Photo" : "📸 Take Photo (waiting for connection...)"}
            </ActionButton>
            <ActionButton onClick={leaveRoom}>Leave Room</ActionButton>
            <ActionButton onClick={() => setShowGallery((v) => !v)}>
              🖼️ Gallery {gallery.length > 0 ? `(${gallery.length})` : ""}
            </ActionButton>
          </div>
          <div style={{ fontSize: 13, marginTop: 10, minHeight: 18, opacity: 0.9 }}>{callStatus}</div>

          {showStrip && (
            <div style={{ marginTop: 20, textAlign: "center" }}>
              <canvas ref={canvasRef} style={{ borderRadius: 10, border: "4px solid #fff", maxWidth: "90vw" }} />
              <div style={{ marginTop: 10 }}>
                <ActionButton onClick={() => downloadPhoto(canvasRef.current.toDataURL("image/png"))}>
                  ⬇️ Download Photo
                </ActionButton>
                <ActionButton onClick={() => setShowStrip(false)}>Take Another</ActionButton>
              </div>
              <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>Saved to your gallery below ✅</div>
            </div>
          )}

          {showGallery && (
            <div
              style={{
                marginTop: 24,
                width: "100%",
                maxWidth: 900,
                background: "rgba(0,0,0,0.35)",
                border: "2px solid #ffcc00",
                borderRadius: 14,
                padding: 16,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ fontSize: 15, fontWeight: "bold" }}>🖼️ Your Snapshots</div>
                <div style={{ fontSize: 12, opacity: 0.75 }}>saved in this browser</div>
              </div>

              {gallery.length === 0 ? (
                <div style={{ fontSize: 13, opacity: 0.8, textAlign: "center", padding: "20px 0" }}>
                  No snapshots yet — take a photo above and it'll show up here.
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                    gap: 14,
                  }}
                >
                  {gallery.map((p) => (
                    <div
                      key={p.id}
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        borderRadius: 10,
                        padding: 8,
                        textAlign: "center",
                      }}
                    >
                      <img
                        src={p.dataUrl}
                        alt={`Snapshot from ${p.takenAt}`}
                        style={{ width: "100%", borderRadius: 6, border: "2px solid #fff" }}
                      />
                      <div style={{ fontSize: 10, opacity: 0.7, marginTop: 6 }}>
                        {FRAMES.find((f) => f.key === p.frame)?.label || p.frame} · {p.takenAt}
                      </div>
                      <div style={{ marginTop: 6, display: "flex", gap: 6, justifyContent: "center" }}>
                        <button
                          onClick={() => downloadPhoto(p.dataUrl, p.id)}
                          style={{
                            fontFamily: "inherit",
                            fontSize: 11,
                            background: "#ff2d75",
                            color: "#fff",
                            border: "none",
                            borderRadius: 6,
                            padding: "5px 9px",
                            cursor: "pointer",
                          }}
                        >
                          ⬇️
                        </button>
                        <button
                          onClick={() => deletePhoto(p.id)}
                          style={{
                            fontFamily: "inherit",
                            fontSize: 11,
                            background: "rgba(255,255,255,0.15)",
                            color: "#fff",
                            border: "none",
                            borderRadius: 6,
                            padding: "5px 9px",
                            cursor: "pointer",
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {showFlash && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "#fff",
            opacity: 0.9,
            pointerEvents: "none",
            zIndex: 99,
            transition: "opacity .4s",
          }}
        />
      )}
    </div>
  );
}

const videoStyle = {
  width: 320,
  maxWidth: "42vw",
  aspectRatio: "4/3",
  objectFit: "cover",
  borderRadius: 10,
  background: "#000",
  transform: "scaleX(-1)",
};

const tagStyle = {
  position: "absolute",
  bottom: 6,
  left: 6,
  background: "rgba(0,0,0,.6)",
  padding: "2px 8px",
  borderRadius: 6,
  fontSize: 11,
};

function ActionButton({ children, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        fontFamily: "inherit",
        background: "#ff2d75",
        color: "#fff",
        border: "none",
        padding: "10px 16px",
        borderRadius: 8,
        fontSize: 14,
        cursor: disabled ? "default" : "pointer",
        margin: "6px 4px",
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {children}
    </button>
  );
}
