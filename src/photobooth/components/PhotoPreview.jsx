import ActionButton from "./ActionButton.jsx";

export default function PhotoPreview({
  canvasRef,
  imageData,
  visible,
  hidePreview,
}) {
  const download = () => {
    if (!imageData) return;
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
        <img
          src={imageData}
          alt="Your latest group photobooth picture"
          className="photo-result-canvas"
        />
      )}
      {visible && (
        <>
          <div className="photo-result-actions">
            <ActionButton onClick={download} variant="primary">Download photo</ActionButton>
            <ActionButton onClick={hidePreview} variant="secondary">Take another</ActionButton>
          </div>
          <div className="photo-result-note">
            Saved to your snapshots
          </div>
        </>
      )}
    </section>
  );
}
