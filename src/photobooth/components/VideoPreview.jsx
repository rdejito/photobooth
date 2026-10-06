import { useEffect, useRef, useState } from "react";

function getStreamAspectRatio(stream) {
  const track = stream?.getVideoTracks?.()[0];
  const { width, height } = track?.getSettings?.() || {};
  return width > 0 && height > 0 ? `${width} / ${height}` : "4 / 3";
}

export default function VideoPreview({
  videoRef,
  stream,
  label,
  muted = false,
}) {
  const elementRef = useRef(null);
  const [aspectRatio, setAspectRatio] = useState(() => getStreamAspectRatio(stream));

  useEffect(() => {
    const video = elementRef.current;
    if (video) video.srcObject = stream;
    setAspectRatio(getStreamAspectRatio(stream));
    return () => {
      if (video) video.srcObject = null;
    };
  }, [stream]);

  const updateAspectRatio = (event) => {
    const { videoWidth, videoHeight } = event.currentTarget;
    if (videoWidth > 0 && videoHeight > 0) {
      setAspectRatio(`${videoWidth} / ${videoHeight}`);
    }
  };

  return (
    <div
      className="participant-card"
      style={{ "--camera-aspect-ratio": aspectRatio }}
    >
      <video
        ref={(element) => {
          elementRef.current = element;
          if (typeof videoRef === "function") videoRef(element);
          else if (videoRef) videoRef.current = element;
        }}
        autoPlay
        playsInline
        muted={muted}
        onLoadedMetadata={updateAspectRatio}
        onResize={updateAspectRatio}
        className="participant-video"
      />
      {!stream && (
        <div className="participant-placeholder" aria-hidden="true">
          <span>{label.slice(0, 1)}</span>
        </div>
      )}
      <div className="participant-label">
        <span className="participant-indicator" />
        {label}
        {muted && <span className="self-tag">YOU</span>}
      </div>
    </div>
  );
}
