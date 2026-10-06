import { getFrameLabel } from "../utils.js";

export default function GalleryPanel({ gallery, deletePhoto, downloadPhoto, onClose }) {
  return (
    <section className="snapshots-panel" role="dialog" aria-modal="true" aria-labelledby="snapshots-title">
      <header className="snapshots-heading">
        <div>
          <p className="snapshots-kicker">LITTLE MOMENTS, KEPT</p>
          <h2 id="snapshots-title">Your snapshots</h2>
        </div>
        <div className="snapshots-heading-actions">
          <span className="snapshots-count">
            {gallery.length} {gallery.length === 1 ? "photo" : "photos"}
          </span>
          <button className="snapshots-close" type="button" onClick={onClose} aria-label="Close snapshots">
            ×
          </button>
        </div>
      </header>
      {gallery.length === 0 ? (
        <div className="snapshots-empty">
          <span aria-hidden="true">✧</span>
          <strong>Your gallery is waiting for its first memory.</strong>
          <small>Take a photo together and it will appear here.</small>
        </div>
      ) : (
        <div className="snapshots-grid">
          {gallery.map((photo) => (
            <article key={photo.id} className="snapshot-card">
              <img
                src={photo.dataUrl}
                alt={`Snapshot from ${photo.takenAt}`}
                className="snapshot-image"
              />
              <div className="snapshot-meta">
                <strong>{getFrameLabel(photo.frame)}</strong>
                <time>{photo.takenAt}</time>
              </div>
              <div className="snapshot-actions">
                <button
                  className="snapshot-download"
                  onClick={() => downloadPhoto(photo)}
                  aria-label={`Download photo from ${photo.takenAt}`}
                >
                  Download
                </button>
                <button
                  className="snapshot-delete"
                  onClick={() => deletePhoto(photo.id)}
                  aria-label={`Delete photo from ${photo.takenAt}`}
                >
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
