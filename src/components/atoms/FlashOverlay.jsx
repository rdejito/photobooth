/**
 * FlashOverlay — a full-screen white veil flashed at the capture moment.
 *
 * Rendered once at the app root; `visible` is driven by the capture hook's
 * flash state. `pointer-events: none` keeps it from blocking the UI while it
 * fades out.
 *
 * @param {object} props
 * @param {boolean} props.visible - Whether the flash is currently showing.
 */
export default function FlashOverlay({ visible }) {
  if (!visible) return null;
  return (
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
  );
}