/**
 * Photo message publishing.
 *
 * The host broadcasts every photo revision — the raw four-shot composition,
 * each frame/layout tweak, and the final save — as a structured message that
 * guests receive and render. Building those messages here gives everything one
 * canonical shape, so revision ids stay unique and every participant always
 * knows whether a message is a live preview or the saved photo.
 */

/** Builds one photo message with a globally unique `captureId-revision` id. */
export function buildPhotoMessage({
  captureId,
  revision,
  preview = false,
  dataUrl,
  frame,
  layout,
  eventName = "",
}) {
  return {
    id: `${captureId}-${revision}`,
    captureId,
    revision,
    preview,
    dataUrl,
    frame,
    layout,
    eventName,
  };
}

/**
 * Publishes a photo message through the room's broadcast callback and returns
 * the message, so callers can keep using it locally if needed.
 */
export function publishPhotoMessage(broadcastPhoto, fields) {
  const message = buildPhotoMessage(fields);
  broadcastPhoto(message);
  return message;
}