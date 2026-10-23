import { FRAME_IDS, LAYOUTS } from "../lib/constants.js";

const CHUNK_SIZE = 12000;
const MAX_PHOTO_SIZE = 4 * 1024 * 1024;
const LAYOUT_KEYS = new Set(LAYOUTS.map(({ key }) => key));
const IMAGE_DATA_URL_RE = /^data:image\/(png|jpeg|webp);base64,/;
const MAX_TRANSFERS_PER_PEER = 4;

export class PhotoTransfer {
  constructor({ onPhoto, onHostPhoto }) {
    this.onPhoto = onPhoto;
    this.onHostPhoto = onHostPhoto;
    this.transfers = new Map();
  }

  send(connection, photo) {
    if (photo.dataUrl.length > MAX_PHOTO_SIZE) {
      throw new Error("The group photo is too large to share.");
    }
    const total = Math.ceil(photo.dataUrl.length / CHUNK_SIZE);
    connection.send({
      type: "photo-start",
      id: photo.id,
      frame: photo.frame,
      layout: photo.layout || "single-horizontal",
      captureId: photo.captureId,
      revision: photo.revision,
      preview: photo.preview === true,
      eventName: typeof photo.eventName === "string" ? photo.eventName : "",
      total,
    });
    for (let index = 0; index < total; index += 1) {
      connection.send({
        type: "photo-chunk",
        id: photo.id,
        index,
        data: photo.dataUrl.slice(index * CHUNK_SIZE, (index + 1) * CHUNK_SIZE),
      });
    }
  }

  receive(connection, message) {
    const key = `${connection.peer}:${message.id}`;
    if (message.type === "photo-start") {
      if (
        typeof message.id !== "string" ||
        message.id.length === 0 ||
        !FRAME_IDS.includes(message.frame) ||
        !LAYOUT_KEYS.has(message.layout) ||
        !Number.isInteger(message.total) ||
        message.total < 1 ||
        message.total > Math.ceil(MAX_PHOTO_SIZE / CHUNK_SIZE)
      ) {
        return;
      }
      const prefix = `${connection.peer}:`;
      let inFlight = 0;
      for (const otherKey of this.transfers.keys()) {
        if (otherKey.startsWith(prefix)) inFlight += 1;
      }
      if (!this.transfers.has(key) && inFlight >= MAX_TRANSFERS_PER_PEER) return;
      this.transfers.set(key, {
        id: message.id,
        frame: message.frame,
        layout: message.layout,
        captureId: typeof message.captureId === "string" ? message.captureId : message.id,
        revision: Number.isInteger(message.revision) && message.revision >= 0
          ? message.revision
          : 0,
        preview: message.preview === true,
        eventName: typeof message.eventName === "string" ? message.eventName : "",
        chunks: new Array(message.total),
        received: 0,
      });
      return;
    }

    const transfer = this.transfers.get(key);
    if (
      !transfer ||
      !Number.isInteger(message.index) ||
      message.index < 0 ||
      message.index >= transfer.chunks.length ||
      typeof message.data !== "string" ||
      message.data.length > CHUNK_SIZE ||
      transfer.chunks[message.index] !== undefined
    ) {
      return;
    }
    transfer.chunks[message.index] = message.data;
    transfer.received += 1;
    if (transfer.received !== transfer.chunks.length) return;

    this.transfers.delete(key);
    const dataUrl = transfer.chunks.join("");
    if (!IMAGE_DATA_URL_RE.test(dataUrl)) return;
    const photo = {
      id: transfer.id,
      frame: transfer.frame,
      layout: transfer.layout,
      captureId: transfer.captureId,
      revision: transfer.revision,
      preview: transfer.preview,
      eventName: transfer.eventName,
      dataUrl,
    };
    this.onPhoto(photo);
    this.onHostPhoto(photo, connection.peer);
  }

  removePeer(peerId) {
    if (!peerId) return;
    const prefix = `${peerId}:`;
    for (const key of Array.from(this.transfers.keys())) {
      if (key.startsWith(prefix)) this.transfers.delete(key);
    }
  }

  clear() {
    this.transfers.clear();
  }
}
