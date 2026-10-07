const CHUNK_SIZE = 12000;
const MAX_PHOTO_SIZE = 4 * 1024 * 1024;

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
      captureId: photo.captureId,
      revision: photo.revision,
      preview: photo.preview === true,
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
        !Number.isInteger(message.total) ||
        message.total < 1 ||
        message.total > Math.ceil(MAX_PHOTO_SIZE / CHUNK_SIZE)
      ) {
        return;
      }
      this.transfers.set(key, {
        id: message.id,
        frame: message.frame,
        captureId: typeof message.captureId === "string" ? message.captureId : message.id,
        revision: Number.isInteger(message.revision) && message.revision >= 0
          ? message.revision
          : 0,
        preview: message.preview === true,
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
    const photo = {
      id: transfer.id,
      frame: transfer.frame,
      captureId: transfer.captureId,
      revision: transfer.revision,
      preview: transfer.preview,
      dataUrl: transfer.chunks.join(""),
    };
    this.onPhoto(photo);
    this.onHostPhoto(photo, connection.peer);
  }

  clear() {
    this.transfers.clear();
  }
}
