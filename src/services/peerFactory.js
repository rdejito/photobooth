import Peer from "peerjs";

/**
 * Builds the PeerJS options, including the ICE servers, from build-time
 * environment configuration.
 *
 * PeerJS ships its own defaults (Google STUN plus its shared, rate-limited
 * TURN), which is not enough for two peers on different home networks: when
 * either side sits behind a symmetric NAT — or any network that blocks UDP —
 * the direct path cannot be punched and only a relay can carry the room.
 *
 * A relay is configured with `VITE_TURN_URLS` (comma-separated), optionally
 * `VITE_TURN_USERNAME`, `VITE_TURN_CREDENTIAL` and `VITE_STUN_URLS`. With no
 * TURN configured this returns an empty object, so PeerJS keeps its own
 * defaults and a same-network booth behaves exactly as before.
 */

const DEFAULT_STUN_URL = "stun:stun.l.google.com:19302";

function splitList(value) {
  return String(value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

/**
 * TURN over UDP alone is useless on a network that blocks UDP — the very case
 * a relay exists to solve — so every plain `turn:` URL also gets a TCP twin.
 * An explicit transport, or a `turns:` URL (already TLS over TCP), is left as
 * the operator wrote it.
 */
function withTcpFallback(url) {
  if (!url.startsWith("turn:") || /[?&]transport=/i.test(url)) return [url];
  const separator = url.includes("?") ? "&" : "?";
  return [url, `${url}${separator}transport=tcp`];
}

/**
 * @param {Record<string, string | undefined>} [env] - Build-time env.
 * @returns {object} Options for the `Peer` constructor; `{}` when unconfigured.
 */
export function createPeerConfig(env = import.meta.env) {
  const turnUrls = splitList(env.VITE_TURN_URLS);
  if (turnUrls.length === 0) return {};

  const stunUrls = splitList(env.VITE_STUN_URLS || DEFAULT_STUN_URL);
  const iceServers = [];
  if (stunUrls.length > 0) iceServers.push({ urls: stunUrls });

  const turn = { urls: turnUrls.flatMap(withTcpFallback) };
  if (env.VITE_TURN_USERNAME) turn.username = env.VITE_TURN_USERNAME;
  if (env.VITE_TURN_CREDENTIAL) turn.credential = env.VITE_TURN_CREDENTIAL;
  iceServers.push(turn);

  return { config: { iceServers } };
}

/**
 * Creates the `Peer` the session runs on, with the configured ICE servers.
 *
 * @param {string} [id] - Claimed peer id (host); omit for a server-assigned one.
 * @returns {Peer} An unstarted PeerJS client.
 */
export function createPeer(id) {
  const options = createPeerConfig();
  return id ? new Peer(id, options) : new Peer(options);
}
