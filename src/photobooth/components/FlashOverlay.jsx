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
