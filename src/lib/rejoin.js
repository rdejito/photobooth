/**
 * Rejoin persistence for the active photobooth room.
 *
 * Only the room code, an opaque per-device rejoin id and the host-issued token
 * are kept — no camera, peer, or media data — so a refreshed or accidentally
 * closed tab can return to the same room. The room is cleared whenever the guest
 * leaves the booth or the host closes the room.
 */

const REJOIN_KEY = "photobooth.rejoin";

function createOpaqueId() {
  const bytes = globalThis.crypto?.getRandomValues?.(new Uint8Array(12));
  if (bytes) {
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  return `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

/** Generates an opaque id that survives reloads so a seat can be claimed. */
export function createDeviceId() {
  return createOpaqueId();
}

/** Generates the host-issued credential a guest presents when reclaiming a seat. */
export function createRejoinToken() {
  return createOpaqueId();
}

/**
 * Normalizes a typed code to the letters and digits the room actually uses.
 * `roomToPeerId` strips every other character when deriving the peer id, so a
 * code like "GEMS-2" must be persisted as "GEMS2" — otherwise the stored
 * payload would fail the size check on the next load and auto-rejoin would
 * silently stop working for exactly the codes it was meant to restore.
 */
export function normalizeRoomCode(code) {
  return String(code ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

/** Remembers the room, this device's rejoin id and the host-issued token. */
export function saveRejoinSession(room, deviceId, rejoinToken = null) {
  try {
    localStorage.setItem(
      REJOIN_KEY,
      JSON.stringify({ room: normalizeRoomCode(room), deviceId, rejoinToken }),
    );
  } catch {
    // Private mode or a full quota simply disables auto-rejoin.
  }
}

/** Reads the saved room, or null when there is nothing valid to rejoin. */
export function readRejoinSession() {
  try {
    const raw = localStorage.getItem(REJOIN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const room = normalizeRoomCode(parsed?.room);
    if (!/^[A-Z0-9]{1,10}$/.test(room)) return null;
    const deviceId =
      typeof parsed?.deviceId === "string" && parsed.deviceId ? parsed.deviceId : null;
    const rejoinToken =
      typeof parsed?.rejoinToken === "string" && parsed.rejoinToken
        ? parsed.rejoinToken
        : null;
    return { room, deviceId, rejoinToken };
  } catch {
    return null;
  }
}

/** Forgets the saved room on an explicit leave or when the room closes. */
export function clearRejoinSession() {
  try {
    localStorage.removeItem(REJOIN_KEY);
  } catch {
    // Nothing to clear if storage is unavailable.
  }
}
