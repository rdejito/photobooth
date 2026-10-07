import ActionButton from "./ActionButton.jsx";
import FramePicker from "./FramePicker.jsx";

export default function PhotoPreview({
  canvasRef,
  imageData,
  visible,
  canCustomize,
  photoPending,
  frame,
  setFrame,
  savePhoto,
  hidePreview,
}) {
  const download = () => {
    if (!imageData || photoPending) return;
    const link = document.createElement("a");
    link.href = imageData;
    link.download = `little-moments-${Date.now()}.png`;
    link.click();
  };

  return (
    <section
      className={`photo-result${visible ? " is-visible" : ""}`}
      role={visible ? "dialog" : undefined}
      aria-modal={visible || undefined}
      aria-label={visible ? "Latest group photo" : undefined}
      aria-hidden={!visible}
    >
      <canvas ref={canvasRef} hidden />
      {visible && (
        <div className="photo-result-editor">
          <img
            src={imageData}
            alt="Your latest group photobooth picture"
            className="photo-result-canvas"
          />
          {canCustomize && (
            <FramePicker frame={frame} setFrame={setFrame} />
          )}
          <div className="photo-result-actions">
            {canCustomize && (
              <ActionButton onClick={savePhoto} variant="primary">
                Save and share photo
              </ActionButton>
            )}
            {!photoPending && (
              <ActionButton onClick={download} variant={canCustomize ? "secondary" : "primary"}>
                Download photo
              </ActionButton>
            )}
            {!photoPending && (
              <ActionButton onClick={hidePreview} variant="secondary">
                Take another
              </ActionButton>
            )}
          </div>
          <div className="photo-result-note">
            {canCustomize
              ? "Choose a frame, then save your finished photo to the snapshots."
              : photoPending
                ? "The host is choosing a frame. The finished photo will appear in your snapshots."
                : "Saved to your snapshots"}
          </div>
        </div>
      )}
    </section>
  );
}
