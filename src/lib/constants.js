export const FRAMES = [
  { key: "classic", label: "💗 Classic", group: "classic", borderWidth: 7 },
  { key: "arcade", label: "🕹️ Arcade", group: "classic", borderWidth: 6 },
  { key: "polaroid", label: "📷 Polaroid", group: "classic", borderWidth: 3 },
  { key: "film", label: "🎞️ Film", group: "classic", borderWidth: 6 },
  { key: "none", label: "⬜ None", group: "classic", borderWidth: 6 },
  { key: "pop", label: "🎉 Pop", group: "pop", borderWidth: 4 },
  { key: "blush", label: "🌸 Blush", group: "pop", borderWidth: 4 },
  { key: "noir", label: "🖤 Noir", group: "pop", borderWidth: 4 },
  { key: "mint", label: "🌿 Mint", group: "pop", borderWidth: 4 },
  { key: "scrapbook", label: "📔 Scrapbook", group: "dark", borderWidth: 5 },
  { key: "darkVictorian", label: "🦇 Victorian", group: "dark", borderWidth: 3 },
  { key: "steampunk", label: "⚙️ Steampunk", group: "dark", borderWidth: 4 },
  { key: "cyberpunk", label: "⚡ Cyberpunk", group: "dark", borderWidth: 4 },
];

export const FRAME_GROUPS = [
  { key: "classic", label: "Original set" },
  { key: "pop", label: "Pop family" },
  { key: "dark", label: "Dark & Fantasy" },
];

export const LAYOUTS = [
  { key: "single-horizontal", label: "↔ Horizontal" },
  { key: "single-vertical", label: "↕ Vertical" },
  { key: "grid-2x2", label: "▦ 2×2 grid" },
];

export const FRAME_IDS = FRAMES.map(({ key }) => key);

/**
 * Slot border width for a frame, in design units. The slot is inset by this on
 * every side before the photo is cover-cropped into it, so the live crop guide
 * and the rendered photo must use the same value.
 */
export function frameBorderWidth(frameKey) {
  return FRAMES.find(({ key }) => key === frameKey)?.borderWidth ?? 0;
}

// A photobooth session captures this many posed shots, each after its own
// three-second countdown and flash, before the final photo is composed.
export const PHOTO_SHOT_COUNT = 4;

// A room holds the host plus this many guests before it turns people away.
export const MAX_PARTICIPANTS = 4;

// How long a dropped participant's tile shows the "Reconnecting…" status
// before it is removed and the roster reflows. A short window absorbs a brief
// network blip or a tab reload without losing the seat (see the rejoin story).
export const DISCONNECT_GRACE_MS = 3000;
