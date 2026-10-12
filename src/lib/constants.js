export const FRAMES = [
  { key: "classic", label: "💗 Classic", group: "classic" },
  { key: "arcade", label: "🕹️ Arcade", group: "classic" },
  { key: "polaroid", label: "📷 Polaroid", group: "classic" },
  { key: "film", label: "🎞️ Film", group: "classic" },
  { key: "none", label: "⬜ None", group: "classic" },
  { key: "pop", label: "🎉 Pop", group: "pop" },
  { key: "blush", label: "🌸 Blush", group: "pop" },
  { key: "noir", label: "🖤 Noir", group: "pop" },
  { key: "mint", label: "🌿 Mint", group: "pop" },
  { key: "scrapbook", label: "📔 Scrapbook", group: "dark" },
  { key: "darkVictorian", label: "🦇 Victorian", group: "dark" },
  { key: "steampunk", label: "⚙️ Steampunk", group: "dark" },
  { key: "cyberpunk", label: "⚡ Cyberpunk", group: "dark" },
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

// A photobooth session captures this many posed shots, each after its own
// three-second countdown and flash, before the final photo is composed.
export const PHOTO_SHOT_COUNT = 4;

// A room holds the host plus this many guests before it turns people away.
export const MAX_PARTICIPANTS = 4;

// How long a dropped participant's tile shows the "Reconnecting…" status
// before it is removed and the roster reflows. A short window absorbs a brief
// network blip or a tab reload without losing the seat (see the rejoin story).
export const DISCONNECT_GRACE_MS = 3000;
